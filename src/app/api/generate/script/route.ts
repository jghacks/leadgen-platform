import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { generateCallScript } from "@/lib/ai/script-generator";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId, senderName, senderAgency } = await req.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: user.id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const issues: string[] = [];
    if (!lead.hasSSL) issues.push("No SSL");
    if (!lead.isMobileOptimized) issues.push("Not mobile-optimized");
    if (!lead.hasChatbot) issues.push("No chatbot");
    if (!lead.hasOnlineBooking) issues.push("No online booking");
    if (!lead.website) issues.push("No website at all");

    const script = await generateCallScript({
      businessName: lead.businessName,
      ownerName: lead.ownerName ?? undefined,
      niche: lead.niche,
      city: lead.city ?? undefined,
      state: lead.state ?? undefined,
      website: lead.website ?? undefined,
      issues,
      opportunities: ["AI chatbot", "website redesign", "online booking"],
      googleRating: lead.googleRating ?? undefined,
      reviewCount: lead.reviewCount ?? undefined,
      senderName,
      senderAgency,
    });

    // Save outreach record
    await prisma.outreach.create({
      data: {
        leadId,
        userId: user.id,
        type: "COLD_CALL_SCRIPT",
        channel: "PHONE",
        content: JSON.stringify(script),
        status: "DRAFT",
        aiModel: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet",
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
