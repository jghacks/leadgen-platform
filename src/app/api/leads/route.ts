import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { z } from "zod";

const LeadQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  niche: z.string().optional(),
  city: z.string().optional(),
  tier: z.enum(["HOT_LEAD", "VERY_LIKELY", "MEDIUM", "LOW_PRIORITY"]).optional(),
  status: z.string().optional(),
  isStarred: z.coerce.boolean().optional(),
  sortBy: z.enum(["reachabilityScore", "createdAt", "businessName", "googleRating"]).default("reachabilityScore"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = LeadQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {
      userId: user.id,
      isArchived: false,
    };

    if (query.search) {
      where.OR = [
        { businessName: { contains: query.search, mode: "insensitive" } },
        { city: { contains: query.search, mode: "insensitive" } },
        { niche: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.niche) where.niche = { contains: query.niche, mode: "insensitive" };
    if (query.city) where.city = { contains: query.city, mode: "insensitive" };
    if (query.tier) where.reachabilityTier = query.tier;
    if (query.status) where.status = query.status;
    if (query.isStarred !== undefined) where.isStarred = query.isStarred;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          audit: { select: { id: true, seoScore: true, performanceScore: true, aiSummary: true } },
          generatedWebsite: { select: { id: true, status: true, deployedUrl: true } },
          pipelineStage: { select: { id: true, name: true, color: true } },
          _count: { select: { outreaches: true, crmNotes: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { ids, update } = body as { ids: string[]; update: Record<string, unknown> };

    // Bulk update
    await prisma.lead.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: update,
    });

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error) {
    console.error("Leads PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
