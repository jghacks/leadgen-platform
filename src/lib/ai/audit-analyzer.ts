/**
 * AI Audit Analyzer
 * Processes raw tech/lighthouse data and generates human-readable AI audit summaries.
 */

import { generateWithClaude } from "./claude";
import type { TechProfile } from "../scraper/tech-detector";

export interface AuditInput {
  businessName: string;
  niche: string;
  website: string;
  tech: TechProfile;
  googleRating?: number;
  reviewCount?: number;
  city?: string;
  state?: string;
}

export interface AuditAnalysis {
  overallScore: number;          // 0-100 composite
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;               // 2-3 sentence executive summary
  criticalIssues: AuditIssue[];
  improvements: AuditImprovement[];
  opportunities: string[];
  estimatedRevenueImpact: string;
  competitorComparison: string;
  aiSuggestions: string[];
}

export interface AuditIssue {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  fix: string;
  impact: string;
}

export interface AuditImprovement {
  category: string;
  title: string;
  currentState: string;
  recommendedState: string;
  effortLevel: "low" | "medium" | "high";
  revenueImpact: "low" | "medium" | "high";
}

export async function analyzeAudit(input: AuditInput): Promise<AuditAnalysis> {
  const location = [input.city, input.state].filter(Boolean).join(", ");
  const tech = input.tech;

  // Build issue list from tech profile
  const detectedIssues: string[] = [];
  if (!tech.hasSSL) detectedIssues.push("No SSL certificate (HTTPS missing)");
  if (!tech.isMobileOptimized) detectedIssues.push("Not mobile-optimized — fails Google mobile-first indexing");
  if (tech.hasBrokenLayout) detectedIssues.push("Website appears broken or inaccessible");
  if (!tech.hasMetaTitle) detectedIssues.push("Missing page title tag — critical SEO issue");
  if (!tech.hasMetaDescription) detectedIssues.push("Missing meta description");
  if (!tech.hasH1) detectedIssues.push("No H1 heading tag found");
  if (!tech.hasSchema) detectedIssues.push("No structured data / schema markup");
  if (!tech.hasContactForm) detectedIssues.push("No contact form found");
  if (!tech.hasChatbot) detectedIssues.push("No chatbot or live chat — losing after-hours leads");
  if (!tech.hasOnlineBooking) detectedIssues.push("No online booking system");
  if (!tech.hasGoogleAnalytics) detectedIssues.push("No analytics tracking");
  if ((tech.loadTimeMs ?? 0) > 4000) detectedIssues.push(`Slow load time: ${((tech.loadTimeMs ?? 0) / 1000).toFixed(1)}s — Google penalizes sites over 3s`);
  if (tech.isWordPress && !tech.hasSSL) detectedIssues.push("WordPress site without security hardening");

  const prompt = `You are a senior web audit specialist. Analyze this business's digital presence and generate a comprehensive audit report as JSON.

BUSINESS: ${input.businessName} (${input.niche} in ${location})
WEBSITE: ${input.website}
GOOGLE RATING: ${input.googleRating ?? "N/A"} (${input.reviewCount ?? 0} reviews)

DETECTED TECHNICAL ISSUES:
${detectedIssues.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

TECH STACK DETECTED: ${tech.techStack.join(", ") || "None detected"}
HAS CHATBOT: ${tech.hasChatbot}
HAS BOOKING: ${tech.hasOnlineBooking}
HAS AI TOOLS: ${tech.hasAI}
HAS CRM: ${tech.hasCRM}
LOAD TIME: ${tech.loadTimeMs ? `${(tech.loadTimeMs / 1000).toFixed(1)}s` : "Unknown"}
MOBILE OPTIMIZED: ${tech.isMobileOptimized}
SSL: ${tech.hasSSL}

Return ONLY valid JSON (no markdown) with this structure:
{
  "overallScore": number 0-100,
  "grade": "A"|"B"|"C"|"D"|"F",
  "summary": "2-3 sentence executive summary of the website's biggest problems and opportunities",
  "criticalIssues": [
    {
      "severity": "critical"|"warning"|"info",
      "title": "Short issue title",
      "description": "What the problem is and why it matters",
      "fix": "Specific actionable fix",
      "impact": "Business impact of fixing this"
    }
  ],
  "improvements": [
    {
      "category": "SEO"|"Performance"|"Conversion"|"AI/Automation"|"Trust"|"Mobile",
      "title": "Improvement name",
      "currentState": "What exists now",
      "recommendedState": "What it should be",
      "effortLevel": "low"|"medium"|"high",
      "revenueImpact": "low"|"medium"|"high"
    }
  ],
  "opportunities": ["array of 5 specific growth opportunities for this business"],
  "estimatedRevenueImpact": "Specific dollar range estimate of revenue being lost monthly due to these issues",
  "competitorComparison": "1-2 sentences on how their site compares to typical competitors in this niche",
  "aiSuggestions": ["array of 4 specific AI tools or automations that would help this business"]
}`;

  try {
    const raw = await generateWithClaude({
      system: "You are a senior web audit specialist and digital marketing expert. Return only valid JSON.",
      prompt,
      maxTokens: 3000,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    return JSON.parse(jsonMatch[0]) as AuditAnalysis;
  } catch {
    return buildFallbackAudit(input, detectedIssues);
  }
}

function buildFallbackAudit(input: AuditInput, issues: string[]): AuditAnalysis {
  const score = Math.max(10, 100 - issues.length * 12);
  const grade = score >= 80 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

  return {
    overallScore: score,
    grade: grade as "A" | "B" | "C" | "D" | "F",
    summary: `${input.businessName}'s website has ${issues.length} significant issues affecting their ability to rank on Google and convert visitors into paying customers. Their digital presence is underperforming compared to competitors in the ${input.niche} space.`,
    criticalIssues: issues.slice(0, 5).map((issue) => ({
      severity: "critical" as const,
      title: issue.split("—")[0].trim(),
      description: issue,
      fix: "Address immediately with professional implementation",
      impact: "Directly reducing leads and revenue",
    })),
    improvements: [
      {
        category: "Mobile",
        title: "Mobile-first redesign",
        currentState: "Not optimized for mobile devices",
        recommendedState: "Fully responsive, fast-loading mobile experience",
        effortLevel: "high",
        revenueImpact: "high",
      },
      {
        category: "AI/Automation",
        title: "AI chatbot & booking system",
        currentState: "No automated lead capture",
        recommendedState: "24/7 AI chatbot + online booking integration",
        effortLevel: "medium",
        revenueImpact: "high",
      },
    ],
    opportunities: [
      "Add AI chatbot to capture after-hours leads",
      "Implement local SEO to rank for nearby searches",
      "Build online booking system to reduce phone tag",
      "Add Google review automation to boost rating",
      "Set up retargeting ads to re-engage website visitors",
    ],
    estimatedRevenueImpact: "$2,000–$8,000/month in missed revenue due to poor digital presence",
    competitorComparison: "Most competitors in this niche have modern, mobile-optimized websites with online booking and strong review profiles — this business is falling behind.",
    aiSuggestions: [
      "AI chatbot (Tidio or custom) for 24/7 lead capture",
      "AI review response automation to boost Google rating",
      "AI receptionist for after-hours call handling",
      "AI-powered email follow-up sequences for leads",
    ],
  };
}
