import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { generateWebsite } from "@/lib/ai/website-generator";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId, regenerate } = await req.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: user.id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    // Return cached if exists and not regenerating
    if (!regenerate) {
      const existing = await prisma.generatedWebsite.findUnique({ where: { leadId } });
      if (existing?.homepageHtml) {
        return NextResponse.json({ website: existing, cached: true });
      }
    }

    const result = await generateWebsite({
      businessName: lead.businessName,
      niche: lead.niche,
      city: lead.city ?? undefined,
      state: lead.state ?? undefined,
      phone: lead.phone ?? undefined,
      email: lead.email ?? undefined,
      address: lead.address ?? undefined,
      website: lead.website ?? undefined,
      googleRating: lead.googleRating ?? undefined,
      reviewCount: lead.reviewCount ?? undefined,
      ownerName: lead.ownerName ?? undefined,
    });

    const website = await prisma.generatedWebsite.upsert({
      where: { leadId },
      create: {
        leadId,
        userId: user.id,
        businessName: lead.businessName,
        homepageHtml: result.html,
        colorScheme: result.colorScheme,
        tagline: result.tagline,
        services: result.services,
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        style: result.style as "MODERN",
        status: "READY",
      },
      update: {
        homepageHtml: result.html,
        colorScheme: result.colorScheme,
        tagline: result.tagline,
        status: "READY",
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    // Log AI generation
    await prisma.aiGeneration.create({
      data: {
        leadId,
        userId: user.id,
        type: "WEBSITE_HTML",
        model: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-20241022",
        prompt: `Website for ${lead.businessName} (${lead.niche})`,
        output: result.html.slice(0, 500) + "...",
      },
    });

    return NextResponse.json({ website, cached: false });
  } catch (error) {
    console.error("Website generation error:", error);
    return NextResponse.json({ error: "Failed to generate website" }, { status: 500 });
  }
}
