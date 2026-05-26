/**
 * AI Reachability Scoring Engine
 * Scores each lead 0-100 and classifies into HOT_LEAD / VERY_LIKELY / MEDIUM / LOW_PRIORITY
 */

import type { TechProfile } from "./tech-detector";
import type { PlaceResult } from "./google-maps";

export type ReachabilityTier = "HOT_LEAD" | "VERY_LIKELY" | "MEDIUM" | "LOW_PRIORITY";

export interface ReachabilityResult {
  score: number;
  tier: ReachabilityTier;
  factors: ReachabilityFactorBreakdown;
  summary: string;
  opportunities: string[];
}

export interface ReachabilityFactorBreakdown {
  websiteQuality: { score: number; label: string; details: string };
  digitalPresence: { score: number; label: string; details: string };
  contactability: { score: number; label: string; details: string };
  aiOpportunity: { score: number; label: string; details: string };
  competitiveGap: { score: number; label: string; details: string };
}

/**
 * Calculate reachability score from 0-100.
 * Higher = more likely to convert / more pain points.
 */
export function calculateReachabilityScore(
  place: PlaceResult,
  tech: TechProfile | null
): ReachabilityResult {
  const factors: ReachabilityFactorBreakdown = {
    websiteQuality: scoreWebsiteQuality(tech),
    digitalPresence: scoreDigitalPresence(place, tech),
    contactability: scoreContactability(place, tech),
    aiOpportunity: scoreAiOpportunity(tech),
    competitiveGap: scoreCompetitiveGap(place, tech),
  };

  // Weighted average
  const score = Math.round(
    factors.websiteQuality.score * 0.25 +
    factors.digitalPresence.score * 0.20 +
    factors.contactability.score * 0.20 +
    factors.aiOpportunity.score * 0.20 +
    factors.competitiveGap.score * 0.15
  );

  const tier = scoreTier(score);
  const opportunities = buildOpportunities(tech, place);
  const summary = buildSummary(score, tier, factors);

  return { score, tier, factors, summary, opportunities };
}

// ─────────────────────────────────────────────────────────────
// Individual Factor Scorers
// ─────────────────────────────────────────────────────────────

function scoreWebsiteQuality(tech: TechProfile | null): ReachabilityFactorBreakdown["websiteQuality"] {
  if (!tech) {
    return { score: 90, label: "No Website", details: "Business has no website — massive opportunity" };
  }

  let score = 0;
  const issues: string[] = [];

  if (!tech.hasSSL) { score += 20; issues.push("No SSL"); }
  if (!tech.isMobileOptimized) { score += 20; issues.push("Not mobile-friendly"); }
  if (tech.isWordPress && !tech.hasCRM) { score += 15; issues.push("Outdated WordPress with no CRM"); }
  if (!tech.hasMetaDescription) { score += 10; issues.push("Missing meta description"); }
  if (!tech.hasH1) { score += 10; issues.push("Missing H1 tag"); }
  if (!tech.hasSchema) { score += 10; issues.push("No schema markup"); }
  if (tech.hasBrokenLayout) { score += 30; issues.push("Broken or inaccessible website"); }
  if ((tech.loadTimeMs ?? 0) > 5000) { score += 15; issues.push("Very slow loading"); }
  else if ((tech.loadTimeMs ?? 0) > 3000) { score += 8; issues.push("Slow loading"); }
  if (!tech.hasContactForm) { score += 10; issues.push("No contact form"); }

  const clampedScore = Math.min(score, 100);
  const label = clampedScore >= 70 ? "Poor" : clampedScore >= 40 ? "Mediocre" : "Decent";
  const details = issues.length > 0 ? issues.slice(0, 3).join(", ") : "Website is fairly solid";

  return { score: clampedScore, label, details };
}

function scoreDigitalPresence(place: PlaceResult, tech: TechProfile | null): ReachabilityFactorBreakdown["digitalPresence"] {
  let score = 0;
  const issues: string[] = [];

  // Review count — thin review presence = pain point
  const reviewCount = place.user_ratings_total ?? 0;
  if (reviewCount < 10) { score += 30; issues.push("Almost no reviews"); }
  else if (reviewCount < 25) { score += 20; issues.push("Few reviews"); }
  else if (reviewCount < 50) { score += 10; }

  // Rating
  const rating = place.rating ?? 0;
  if (rating < 3.5 && rating > 0) { score += 25; issues.push("Low rating needs reputation management"); }

  // No analytics
  if (!tech?.hasAnalytics) { score += 15; issues.push("No analytics tracking"); }
  if (!tech?.hasAdPixel) { score += 10; issues.push("No ad pixels"); }
  if (!tech?.hasFacebookPixel) { score += 5; }

  const clampedScore = Math.min(score, 100);
  const label = clampedScore >= 60 ? "Weak" : clampedScore >= 30 ? "Limited" : "Established";
  const details = issues.length > 0 ? issues.slice(0, 3).join(", ") : "Decent digital presence";

  return { score: clampedScore, label, details };
}

function scoreContactability(place: PlaceResult, tech: TechProfile | null): ReachabilityFactorBreakdown["contactability"] {
  let score = 50; // Start medium
  const details: string[] = [];

  if (place.formatted_phone_number) { score += 20; details.push("Phone listed"); }
  if (tech?.hasPhoneNumber) { score += 10; }
  if (tech?.hasContactForm) { score += 15; details.push("Contact form exists"); }
  if (!place.website) { score += 10; details.push("No website (cold call preferred)"); }

  const clampedScore = Math.min(score, 100);
  const label = clampedScore >= 70 ? "Easy to reach" : clampedScore >= 40 ? "Reachable" : "Hard to reach";
  const detailStr = details.slice(0, 2).join(", ") || "Limited contact info";

  return { score: clampedScore, label, details: detailStr };
}

function scoreAiOpportunity(tech: TechProfile | null): ReachabilityFactorBreakdown["aiOpportunity"] {
  if (!tech) {
    return { score: 100, label: "Maximum", details: "No website at all — AI automation would transform this business" };
  }

  let score = 0;
  const opportunities: string[] = [];

  if (!tech.hasChatbot) { score += 25; opportunities.push("No chatbot"); }
  if (!tech.hasOnlineBooking) { score += 20; opportunities.push("No online booking"); }
  if (!tech.hasAI) { score += 20; opportunities.push("Zero AI tools"); }
  if (!tech.hasCRM) { score += 15; opportunities.push("No CRM"); }
  if (!tech.hasEmailMarketing) { score += 10; opportunities.push("No email marketing"); }
  if (!tech.hasLiveChat) { score += 10; opportunities.push("No live support"); }

  const clampedScore = Math.min(score, 100);
  const label = clampedScore >= 70 ? "Massive" : clampedScore >= 40 ? "Significant" : "Moderate";
  const details = opportunities.length > 0 ? opportunities.slice(0, 3).join(", ") : "Some AI already in use";

  return { score: clampedScore, label, details };
}

function scoreCompetitiveGap(place: PlaceResult, tech: TechProfile | null): ReachabilityFactorBreakdown["competitiveGap"] {
  let score = 30; // Baseline
  const factors: string[] = [];

  // Old or slow website = likely behind competitors
  if (tech?.isWordPress) { score += 15; factors.push("Old CMS"); }
  if (!tech?.isMobileOptimized) { score += 20; factors.push("Mobile not optimized"); }
  if ((place.user_ratings_total ?? 0) < 20) { score += 15; factors.push("Below-average review count"); }

  // No modern stack = likely behind
  if (!tech?.frameworkDetected) { score += 10; }
  if (!tech?.hasSchema) { score += 10; factors.push("Missing schema = lower SEO rank"); }

  const clampedScore = Math.min(score, 100);
  const label = clampedScore >= 60 ? "Falling behind" : clampedScore >= 40 ? "At risk" : "Competitive";
  const details = factors.length > 0 ? factors.slice(0, 2).join(", ") : "Relatively competitive";

  return { score: clampedScore, label, details };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function scoreTier(score: number): ReachabilityTier {
  if (score >= 75) return "HOT_LEAD";
  if (score >= 55) return "VERY_LIKELY";
  if (score >= 35) return "MEDIUM";
  return "LOW_PRIORITY";
}

function buildOpportunities(tech: TechProfile | null, place: PlaceResult): string[] {
  const ops: string[] = [];

  if (!place.website) ops.push("Build them a website from scratch — massive opportunity");
  if (!tech?.hasChatbot) ops.push("Add AI chatbot to capture after-hours leads");
  if (!tech?.hasOnlineBooking) ops.push("Implement online booking system");
  if (!tech?.isMobileOptimized) ops.push("Mobile-optimize their website");
  if (!tech?.hasSSL) ops.push("Add SSL certificate and security");
  if (!tech?.hasSchema) ops.push("Add schema markup to boost local SEO rankings");
  if (!tech?.hasGoogleAnalytics) ops.push("Set up analytics and conversion tracking");
  if (!tech?.hasCRM) ops.push("Implement CRM and lead management system");
  if (!tech?.hasEmailMarketing) ops.push("Build email marketing automation");
  if ((place.user_ratings_total ?? 0) < 20) ops.push("Reputation management campaign to get more reviews");

  return ops;
}

function buildSummary(score: number, tier: ReachabilityTier, factors: ReachabilityFactorBreakdown): string {
  const tierLabels = {
    HOT_LEAD: "🔥 HOT LEAD",
    VERY_LIKELY: "⭐ VERY LIKELY",
    MEDIUM: "📊 MEDIUM",
    LOW_PRIORITY: "🔵 LOW PRIORITY",
  };

  return `${tierLabels[tier]} (${score}/100) — Website: ${factors.websiteQuality.label}, Digital Presence: ${factors.digitalPresence.label}, AI Opportunity: ${factors.aiOpportunity.label}`;
}
