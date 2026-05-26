import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { detectTech } from "@/lib/scraper/tech-detector";
import { analyzeAudit } from "@/lib/ai/audit-analyzer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: user.id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (!lead.website) {
      return NextResponse.json({ error: "No website to audit" }, { status: 400 });
    }

    // Detect tech profile
    const tech = await detectTech(lead.website);

    // AI audit analysis
    const analysis = await analyzeAudit({
      businessName: lead.businessName,
      niche: lead.niche,
      website: lead.website,
      tech,
      googleRating: lead.googleRating ?? undefined,
      reviewCount: lead.reviewCount ?? undefined,
      city: lead.city ?? undefined,
      state: lead.state ?? undefined,
    });

    // Save audit to DB
    const audit = await prisma.audit.upsert({
      where: { leadId },
      create: {
        leadId,
        performanceScore: analysis.overallScore,
        seoScore: tech.hasMetaTitle && tech.hasMetaDescription && tech.hasH1 ? 70 : 30,
        hasMetaTitle: tech.hasMetaTitle,
        hasMetaDescription: tech.hasMetaDescription,
        hasH1: tech.hasH1,
        hasSchema: tech.hasSchema,
        hasOpenGraph: tech.hasOpenGraph,
        hasSitemap: tech.hasSitemap,
        hasRobots: tech.hasRobots,
        hasHTTPS: tech.hasSSL,
        isResponsive: tech.isMobileOptimized,
        aiSummary: analysis.summary,
        criticalIssues: analysis.criticalIssues,
        improvements: analysis.improvements,
        opportunities: analysis.opportunities,
        estimatedRevenueImpact: analysis.estimatedRevenueImpact,
        competitorComparison: { note: analysis.competitorComparison },
      },
      update: {
        aiSummary: analysis.summary,
        criticalIssues: analysis.criticalIssues,
        improvements: analysis.improvements,
        opportunities: analysis.opportunities,
        estimatedRevenueImpact: analysis.estimatedRevenueImpact,
        updatedAt: new Date(),
      },
    });

    // Update lead scores
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        seoScore: audit.seoScore,
        performanceScore: audit.performanceScore,
        hasSSL: tech.hasSSL,
        isMobileOptimized: tech.isMobileOptimized,
        hasChatbot: tech.hasChatbot,
        hasOnlineBooking: tech.hasOnlineBooking,
        hasAI: tech.hasAI,
        techStack: tech.techStack,
      },
    });

    return NextResponse.json({ audit, analysis });
  } catch (error) {
    console.error("Audit POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
