/**
 * AI Cold Email Generator
 * Generates hyper-personalized cold emails using lead data.
 */

import { generateWithClaude } from "./claude";

export interface EmailGenerationInput {
  businessName: string;
  ownerName?: string;
  niche: string;
  city?: string;
  state?: string;
  website?: string;
  googleRating?: number;
  reviewCount?: number;
  reachabilityScore?: number;
  issues: string[];           // detected website/SEO/AI issues
  opportunities: string[];    // AI-identified opportunities
  senderName?: string;
  senderAgency?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  followUp1: string;
  followUp2: string;
  followUp3: string;
  smsVariant: string;
  linkedinVariant: string;
}

const SYSTEM_PROMPT = `You are a world-class B2B copywriter and agency closer for a web design + AI automation agency.
You write cold emails that feel human, specific, and valuable — not spammy or generic.
Your emails have 40%+ open rates and 8%+ reply rates.
Tone: conversational, confident, genuinely helpful. Never cringe, never robotic.
Structure: short paragraphs, 1-2 sentences each, max 180 words for first email.
Always lead with a specific observation about THEIR business — not about you.`;

export async function generateColdEmails(input: EmailGenerationInput): Promise<GeneratedEmail> {
  const location = [input.city, input.state].filter(Boolean).join(", ");
  const topIssues = input.issues.slice(0, 3).join(", ");
  const topOpportunity = input.opportunities[0] ?? "modernize their digital presence";

  const prompt = `Generate a cold email sequence for this prospect:

PROSPECT:
- Business: ${input.businessName}
- Owner: ${input.ownerName ?? "Business Owner"}
- Niche: ${input.niche}
- Location: ${location}
- Website: ${input.website ?? "No website found"}
- Google Rating: ${input.googleRating ?? "N/A"} (${input.reviewCount ?? 0} reviews)
- Key problems detected: ${topIssues || "outdated website, no AI systems, poor mobile experience"}
- Top opportunity: ${topOpportunity}
- Agency: ${input.senderAgency ?? "Our Agency"}
- Sender: ${input.senderName ?? "Alex"}

Generate a JSON object with these exact keys (no markdown, raw JSON only):
{
  "subject": "a subject line that's specific and curiosity-driven, max 8 words",
  "body": "Initial cold email. Start with an ultra-specific observation about their business or a problem you noticed. Then one sentence on what you do. Then ONE bullet with the biggest opportunity. CTA: ask for 15-minute call. Max 160 words. NO generic openers like 'I hope this email finds you'.",
  "followUp1": "Day 3 follow-up. Reference the first email. Share a quick stat or case study relevant to their niche. Short — 80 words max.",
  "followUp2": "Day 7 follow-up. Change the angle entirely. Lead with a competitor comparison or missed revenue insight. Ask a question. 90 words max.",
  "followUp3": "Day 14 breakup email. Friendly, no hard sell. Leave the door open. 60 words max.",
  "smsVariant": "SMS version of the initial pitch. 160 characters max. Must include business name and a clear CTA.",
  "linkedinVariant": "LinkedIn connection request note (300 chars max) + a follow-up DM (400 chars max) formatted as: NOTE: [text] | DM: [text]"
}`;

  const raw = await generateWithClaude({ system: SYSTEM_PROMPT, prompt, maxTokens: 2048 });

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    return JSON.parse(jsonMatch[0]) as GeneratedEmail;
  } catch {
    // Fallback structure
    return {
      subject: `Quick question about ${input.businessName}'s website`,
      body: raw.slice(0, 800),
      followUp1: "Just wanted to bump this to the top of your inbox...",
      followUp2: "I noticed a few competitors in your area recently upgraded...",
      followUp3: "I'll leave it here — if the timing's ever right, you know where to find me.",
      smsVariant: `Hi, saw ${input.businessName}'s site online — think we could help you get 3x more leads. Worth a 15-min chat? - ${input.senderName ?? "Alex"}`,
      linkedinVariant: `NOTE: Hey! Love what ${input.businessName} is doing in ${location}. Would love to connect. | DM: Noticed a few things on your website that could be pulling in a lot more leads — happy to share what I found if you're open to it.`,
    };
  }
}

export async function generateProposal(input: EmailGenerationInput & {
  proposalValue?: number;
  services?: string[];
}): Promise<string> {
  const location = [input.city, input.state].filter(Boolean).join(", ");

  const prompt = `Write a professional agency proposal for:

CLIENT: ${input.businessName} (${input.niche} in ${location})
OWNER: ${input.ownerName ?? "Business Owner"}
ISSUES FOUND: ${input.issues.join(", ")}
PROPOSED SERVICES: ${input.services?.join(", ") ?? "Website Redesign, AI Chatbot, SEO Optimization"}
INVESTMENT: $${input.proposalValue?.toLocaleString() ?? "3,500"} one-time + monthly retainer

Write a persuasive, structured proposal HTML document with:
1. Executive Summary (problem + our solution)
2. What We Found (audit results — be specific)
3. Our Solution (services + what they include)
4. Expected Results (ROI, leads, calls, rankings)
5. Investment & Timeline
6. Why Us (differentiators)
7. Next Steps (clear CTA)

Use professional styling with clean HTML/CSS. Make it look like a $5,000 proposal.`;

  return generateWithClaude({ system: SYSTEM_PROMPT, prompt, maxTokens: 4096 });
}
