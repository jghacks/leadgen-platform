import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import prisma from "@/lib/prisma";
import { scrapeGoogleMaps, extractCityState, checkOwnerRespondsToReviews } from "@/lib/scraper/google-maps";
import { detectTech } from "@/lib/scraper/tech-detector";
import { calculateReachabilityScore } from "@/lib/scraper/scoring";
import { z } from "zod";

const ScrapeSchema = z.object({
  niche: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  radius: z.number().min(1).max(100).default(25),
  minReviews: z.number().min(0).max(1000).default(0),
  requireWebsite: z.boolean().default(false),
  requireEmail: z.boolean().default(false),
  outdatedWebsiteOnly: z.boolean().default(false),
  aiOpportunityOnly: z.boolean().default(false),
  maxResults: z.number().min(1).max(100).default(50),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const params = ScrapeSchema.parse(body);

    // Create scrape job record
    const job = await prisma.scrapeJob.create({
      data: {
        userId: user.id,
        niche: params.niche,
        location: params.location,
        radius: params.radius * 1609, // convert miles to meters
        minReviews: params.minReviews,
        requireWebsite: params.requireWebsite,
        requireEmail: params.requireEmail,
        status: "RUNNING",
        filters: params,
      },
    });

    // Start async scraping (fire and forget pattern)
    scrapeInBackground(job.id, params, user.id).catch((err) =>
      console.error(`Scrape job ${job.id} failed:`, err)
    );

    return NextResponse.json({
      jobId: job.id,
      status: "RUNNING",
      message: `Scraping ${params.niche} businesses in ${params.location}...`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    console.error("Scrape API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (jobId) {
      const job = await prisma.scrapeJob.findFirst({
        where: { id: jobId, userId: user.id },
      });
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

      const leads = job.status === "COMPLETED"
        ? await prisma.lead.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 })
        : [];

      return NextResponse.json({ job, leads });
    }

    // Return recent jobs
    const jobs = await prisma.scrapeJob.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Scrape GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Background scrape worker ────────────────────────────────────────────────

async function scrapeInBackground(
  jobId: string,
  params: z.infer<typeof ScrapeSchema>,
  userId: string
) {
  let processed = 0;
  let errors = 0;

  try {
    const places = await scrapeGoogleMaps({
      niche: params.niche,
      location: params.location,
      radius: params.radius * 1609,
      minReviews: params.minReviews,
      maxResults: params.maxResults,
    });

    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: { totalFound: places.length, progress: 10 },
    });

    const leadsToCreate = [];

    for (const place of places) {
      try {
        // Skip if no website required
        if (params.requireWebsite && !place.website) {
          processed++;
          continue;
        }

        // Detect website tech
        let tech = null;
        if (place.website) {
          try {
            tech = await detectTech(place.website);
          } catch {
            errors++;
          }
        }

        // Apply filters
        if (params.aiOpportunityOnly && tech?.hasAI) {
          processed++;
          continue;
        }

        if (params.outdatedWebsiteOnly && tech && tech.isMobileOptimized && tech.hasSSL) {
          processed++;
          continue;
        }

        // Calculate reachability score
        const reachability = calculateReachabilityScore(place, tech);

        const { city, state, zipCode } = extractCityState(place.address_components);
        const ownerResponds = checkOwnerRespondsToReviews(place);

        leadsToCreate.push({
          userId,
          businessName: place.name,
          phone: place.formatted_phone_number,
          website: place.website,
          address: place.formatted_address,
          city,
          state,
          zipCode,
          latitude: place.geometry?.location.lat,
          longitude: place.geometry?.location.lng,
          niche: params.niche,
          googleRating: place.rating,
          reviewCount: place.user_ratings_total,
          googlePlaceId: place.place_id,
          source: "GOOGLE_MAPS" as const,

          // Tech profile
          hasSSL: tech?.hasSSL,
          isMobileOptimized: tech?.isMobileOptimized,
          hasOnlineBooking: tech?.hasOnlineBooking,
          hasChatbot: tech?.hasChatbot,
          hasAI: tech?.hasAI,
          hasEcommerce: tech?.hasEcommerce,
          hasAnalytics: tech?.hasAnalytics,
          hasCRM: tech?.hasCRM,
          hasEmailMarketing: tech?.hasEmailMarketing,
          hasAdPixel: tech?.hasAdPixel,
          frameworkDetected: tech?.frameworkDetected,
          cmsDetected: tech?.cmsDetected,
          techStack: tech?.techStack ?? [],
          seoScore: calculateSeoScore(tech),
          performanceScore: calculatePerformanceScore(tech),

          // Reachability
          reachabilityScore: reachability.score,
          reachabilityTier: reachability.tier,
          reachabilityFactors: reachability.factors,

          status: "NEW" as const,
          priority: scoreToPriority(reachability.score),
        });

        processed++;

        // Update progress every 5 leads
        if (processed % 5 === 0) {
          await prisma.scrapeJob.update({
            where: { id: jobId },
            data: {
              processed,
              errors,
              progress: Math.min(90, Math.round((processed / places.length) * 90)),
            },
          });
        }
      } catch (err) {
        errors++;
        console.error(`Error processing place ${place.place_id}:`, err);
      }
    }

    // Bulk create leads (upsert by googlePlaceId + userId to avoid dupes)
    if (leadsToCreate.length > 0) {
      for (const lead of leadsToCreate) {
        await prisma.lead.upsert({
          where: {
            // Use composite if you have unique index — otherwise just create
            id: `${userId}-${lead.googlePlaceId ?? lead.businessName}`,
          },
          create: lead,
          update: {
            reachabilityScore: lead.reachabilityScore,
            reachabilityTier: lead.reachabilityTier,
            updatedAt: new Date(),
          },
        }).catch(() => {
          // If upsert key doesn't work, just create
          return prisma.lead.create({ data: { ...lead, id: undefined } });
        });
      }
    }

    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        processed,
        errors,
        totalFound: places.length,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: { status: "FAILED", completedAt: new Date() },
    });
    throw err;
  }
}

function calculateSeoScore(tech: ReturnType<typeof Object.create> | null): number {
  if (!tech) return 10;
  let score = 0;
  if (tech.hasMetaTitle) score += 20;
  if (tech.hasMetaDescription) score += 20;
  if (tech.hasH1) score += 15;
  if (tech.hasSchema) score += 15;
  if (tech.hasOpenGraph) score += 10;
  if (tech.hasSitemap) score += 10;
  if (tech.hasRobots) score += 10;
  return score;
}

function calculatePerformanceScore(tech: ReturnType<typeof Object.create> | null): number {
  if (!tech) return 10;
  const loadMs = tech.loadTimeMs ?? 5000;
  if (loadMs < 1000) return 95;
  if (loadMs < 2000) return 80;
  if (loadMs < 3000) return 60;
  if (loadMs < 5000) return 40;
  return 20;
}

function scoreToPriority(score: number): "LOW" | "MEDIUM" | "HIGH" | "URGENT" {
  if (score >= 75) return "URGENT";
  if (score >= 55) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}
