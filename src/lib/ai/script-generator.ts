/**
 * AI Cold Call Script Generator
 * Generates persuasive, niche-specific call scripts with full objection handling.
 */

import { generateWithClaude } from "./claude";

export interface ScriptInput {
  businessName: string;
  ownerName?: string;
  niche: string;
  city?: string;
  state?: string;
  website?: string;
  issues: string[];
  opportunities: string[];
  googleRating?: number;
  reviewCount?: number;
  estimatedRevenue?: string;
  senderName?: string;
  senderAgency?: string;
}

export interface GeneratedScript {
  opener: string;
  pitch: string;
  valueProposition: string;
  objectionHandling: Record<string, string>;
  closingScript: string;
  voicemailScript: string;
  followUpScript: string;
  roiPitch: string;
  aiReceptionistPitch: string;
  websiteRedesignPitch: string;
}

const SCRIPT_SYSTEM = `You are a high-ticket sales trainer who coaches agency owners to close $3k-$10k deals over the phone.
Your scripts are conversational, confident, and genuinely consultative — not pushy or scripted-sounding.
Every script is hyper-personalized to the specific business. You never use cringe openers.
Tone: friendly peer energy, not salesperson energy. You're calling to help, not sell.`;

export async function generateCallScript(input: ScriptInput): Promise<GeneratedScript> {
  const location = [input.city, input.state].filter(Boolean).join(", ");
  const topIssues = input.issues.slice(0, 3);
  const estimatedLoss = estimateLostRevenue(input);

  const prompt = `Generate a complete cold call script package for this prospect. Return raw JSON only.

PROSPECT DATA:
- Business: ${input.businessName}
- Owner: ${input.ownerName ?? "the owner"}
- Niche: ${input.niche} in ${location}
- Website issues: ${topIssues.join(", ") || "outdated design, no chatbot, poor mobile"}
- Top opportunity: ${input.opportunities[0] ?? "AI automation + new website"}
- Estimated monthly revenue lost: ${estimatedLoss}
- Caller: ${input.senderName ?? "Alex"} from ${input.senderAgency ?? "the agency"}

Generate JSON with these exact keys:

{
  "opener": "First 15 seconds. Use their name. Be casual and direct. Reference something specific you noticed about their business. Do NOT say 'Is this a good time?' — just state your reason confidently. 50 words max.",

  "pitch": "Core 60-second pitch after they say 'go ahead'. Mention 2-3 specific problems you found. Quantify the pain. Bridge to your solution. End with a question. 120 words max.",

  "valueProposition": "One-liner value prop, max 2 sentences. What you do + the outcome. Niche-specific.",

  "objectionHandling": {
    "not interested": "Redirect script. 40 words. Acknowledge, reframe to their pain, ask one question.",
    "we already have someone": "Script to uncover if their current person is actually getting results. 50 words.",
    "how much does it cost": "Defer to value first. Then give a range with context. 60 words.",
    "send me something": "Yes + qualify. Send info + book a call. 40 words.",
    "not the right time": "Future-pacing script. Plant a seed. Stay in touch. 40 words.",
    "i built it myself": "Compliment + introduce the ROI gap. 50 words."
  },

  "closingScript": "Trial close to book a 20-minute Zoom demo. Assume the yes. Offer two time slots. 60 words.",

  "voicemailScript": "Compelling 25-second voicemail. Mention their business name. One specific thing you noticed. CTA to call back or check email. 45 words.",

  "followUpScript": "Day 2 follow-up call opener referencing the voicemail. 40 words.",

  "roiPitch": "ROI-focused pitch section: if we get you just 3 extra clients per month from your website at $${calculateAvgTicket(input.niche)}/client, that's $${calculateMonthlyROI(input.niche)}/month — our fee pays for itself in week one. Customize for their niche. 80 words.",

  "aiReceptionistPitch": "Pitch for adding an AI receptionist to their business. Use their niche. Talk about missed calls = missed revenue. 70 words.",

  "websiteRedesignPitch": "Pitch specifically for the website redesign. Reference their current site's issues. Show them the vision of the new site. Close with timeline urgency. 80 words."
}`;

  const raw = await generateWithClaude({ system: SCRIPT_SYSTEM, prompt, maxTokens: 3000 });

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    return JSON.parse(jsonMatch[0]) as GeneratedScript;
  } catch {
    return buildFallbackScript(input, location, estimatedLoss);
  }
}

function estimateLostRevenue(input: ScriptInput): string {
  const avgTickets: Record<string, number> = {
    hvac: 800, lawyer: 3000, dentist: 500, restaurant: 60,
    gym: 150, plumber: 400, realtor: 8000, doctor: 250,
  };
  const niche = input.niche.toLowerCase();
  const ticket = Object.entries(avgTickets).find(([k]) => niche.includes(k))?.[1] ?? 500;
  const monthlyMissed = Math.round(ticket * 8); // ~8 missed leads/mo
  return `$${monthlyMissed.toLocaleString()}/month`;
}

function calculateAvgTicket(niche: string): number {
  const tickets: Record<string, number> = {
    hvac: 800, lawyer: 3000, dentist: 500, restaurant: 60, gym: 150, plumber: 400,
  };
  const lower = niche.toLowerCase();
  return Object.entries(tickets).find(([k]) => lower.includes(k))?.[1] ?? 500;
}

function calculateMonthlyROI(niche: string): string {
  return (calculateAvgTicket(niche) * 3).toLocaleString();
}

function buildFallbackScript(input: ScriptInput, location: string, estimatedLoss: string): GeneratedScript {
  const name = input.ownerName ?? "there";
  const biz = input.businessName;
  const agency = input.senderAgency ?? "our agency";
  const caller = input.senderName ?? "Alex";

  return {
    opener: `"Hey ${name}! This is ${caller} — I was actually looking at ${biz}'s website earlier and noticed a couple things I thought you'd want to know about. Got 60 seconds?"`,
    pitch: `"So I specialize in helping ${input.niche} businesses in ${location} get more leads from their online presence. When I looked at your site, I noticed [specific issues]. That's typically leaving around ${estimatedLoss} on the table every month. We've helped similar businesses in your area add 15-30% more inbound calls within 90 days — and I'd love to show you exactly how."`,
    valueProposition: `We build AI-powered websites and automation systems that turn ${input.niche} businesses into lead-generating machines — guaranteed results in 90 days or we work for free.`,
    objectionHandling: {
      "not interested": `"Totally get it — the last thing you need is another sales call. I'm not trying to sell you anything today. I just found something specific on your site that's costing you leads and thought I'd flag it. Can I just share what I found in 30 seconds?"`,
      "we already have someone": `"That's great — who handles it? [Listen] Out of curiosity, do you know what your current conversion rate is from website visitors to phone calls? Most ${input.niche} sites we see are sitting around 1-2%. We typically get clients to 6-8%. Just wondering if they're tracking that for you."`,
      "how much does it cost": `"Great question — and fair. Before I give you a number, let me make sure it even makes sense for you. We typically work with ${input.niche} businesses in the $3,500-$8,000 range for a full build. But honestly, if the ROI doesn't make sense for you, I'd tell you. What does a new client typically bring you?"`,
      "send me something": `"Absolutely — I'll send it right now while we're talking. What's the best email? And while I've got you — would it make sense to do a quick 15-minute Zoom this week so I can actually walk you through what I found? Tuesday or Thursday morning work?"`,
      "not the right time": `"Totally understand. When would be a better time — Q1? Q2? I just want to make sure I check back in when it's relevant. And hey — even if you're not looking to invest right now, would it be helpful if I sent you a quick audit of what we found? No strings attached."`,
      "i built it myself": `"That's awesome — honestly impressive. A lot of owners I talk to built their own site and it's better than what a lot of agencies put out. Quick question though — are you happy with how many leads it's actually generating? Because even great-looking sites often have backend SEO and conversion issues that kill the results."`,
    },
    closingScript: `"Based on what you've told me, I think there's a real opportunity here. How does your calendar look this week? I can do a 20-minute Zoom — I'll show you exactly what we'd build for ${biz} and what the numbers would look like. Does Tuesday at 10am or Thursday at 2pm work better?"`,
    voicemailScript: `"Hey ${name}, this is ${caller} from ${agency}. I was looking at ${biz}'s website today and found something I think you'd actually want to know about — it's costing you leads every week. Give me a call back at [number] or check your email — I'll send over what I found. Talk soon."`,
    followUpScript: `"Hey ${name}, ${caller} again — left you a voicemail yesterday about ${biz}'s website. Did you get a chance to check out what I sent over? I wanted to walk you through it real quick."`,
    roiPitch: `"Here's the math on this — if we get you just 3 extra clients a month from your website at your average ticket, that's ${estimatedLoss} in new revenue every month. Our fee pays for itself in the first week. And most of our ${input.niche} clients see results within 60 days."`,
    aiReceptionistPitch: `"One thing that's massive for ${input.niche} businesses right now is an AI receptionist — it answers calls 24/7, qualifies leads, books appointments, and never misses a call. The average business in your niche misses 35% of inbound calls. That's real money walking out the door. We can have this live for you within a week."`,
    websiteRedesignPitch: `"When I pulled up ${biz}'s site, the biggest thing I noticed was [specific issue]. Your competitors — I actually looked at three of them in ${location} — they all have [what competitors have]. The good news is we can turn this around fast. We'd build you something that looks like a $20,000 site at a fraction of the cost, and it would be optimized to actually convert visitors into calls."`,
  };
}
