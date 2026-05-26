import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { generateColdEmails } from "@/lib/ai/email-generator";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId, senderName, senderAgency } = await req.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: user.id },
      include: { audit: true },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const issues: string[] = [];
    if (!lead.hasSSL) issues.push("No SSL certificate");
    if (!lead.isMobileOptimized) issues.push("Not mobile-optimized");
    if (!lead.hasChatbot) issues.push("No chatbot");
    if (!lead.hasOnlineBooking) issues.push("No online booking");
    if (!lead.hasAI) issues.push("No AI tools");
    if ((lead.seoScore ?? 0) < 50) issues.push("Poor SEO score");

    const opportunities = (lead.reachabilityFactors as Record<string, unknown> | null)
      ? ["Add AI chatbot", "Improve mobile experience", "Boost local SEO", "Add online booking"]
      : ["Modernize website design", "Add AI chatbot", "Online booking integration"];

    const emails = await generateColdEmails({
      businessName: lead.businessName,
      ownerName: lead.ownerName ?? undefined,
      niche: lead.niche,
      city: lead.city ?? undefined,
      state: lead.state ?? undefined,
      website: lead.website ?? undefined,
      googleRating: lead.googleRating ?? undefined,
      reviewCount: lead.reviewCount ?? undefined,
      issues,
      opportunities,
      senderName,
      senderAgency,
    });

    // Save outreach records
    await prisma.outreach.createMany({
      data: [
        {
          leadId,
          userId: user.id,
          type: "COLD_EMAIL",
          channel: "EMAIL",
          subject: emails.subject,
          content: emails.body,
          status: "DRAFT",
          aiModel: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet",
          generatedAt: new Date(),
        },
        {
          leadId,
          userId: user.id,
          type: "FOLLOW_UP_EMAIL",
          channel: "EMAIL",
          subject: `Re: ${emails.subject}`,
          content: emails.followUp1,
          status: "DRAFT",
          aiModel: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet",
          generatedAt: new Date(),
        },
      ],
    });

    await prisma.aiGeneration.create({
      data: {
        leadId,
        userId: user.id,
        type: "COLD_EMAIL",
        model: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20241022",
        prompt: `Cold email for ${lead.businessName}`,
        output: emails.body,
      },
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json({ error: "Failed to generate emails" }, { status: 500 });
  }
}
