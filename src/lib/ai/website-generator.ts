/**
 * AI Website Generator
 * Generates complete, niche-specific website HTML using Claude.
 * Each generated site is unique to the business's industry.
 */

import { generateWithClaude } from "./claude";

export interface WebsiteGenerationInput {
  businessName: string;
  niche: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  services?: string[];
  googleRating?: number;
  reviewCount?: number;
  ownerName?: string;
  website?: string;
  reachabilityScore?: number;
  opportunities?: string[];
}

export interface GeneratedWebsite {
  html: string;
  colorScheme: ColorScheme;
  tagline: string;
  services: string[];
  seoTitle: string;
  seoDescription: string;
  style: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
}

// Niche-specific design systems
const NICHE_THEMES: Record<string, {
  style: string;
  colors: ColorScheme;
  mood: string;
  animations: string;
  icons: string;
}> = {
  hvac: {
    style: "professional-industrial",
    colors: {
      primary: "#0ea5e9",
      secondary: "#0369a1",
      accent: "#f97316",
      background: "#0f172a",
      text: "#f8fafc",
      gradient: "from-sky-600 via-blue-700 to-slate-900",
    },
    mood: "trustworthy, emergency-ready, 24/7 available",
    animations: "cool-air particles, temperature gauge, snowflake drift",
    icons: "❄️🔥🌡️",
  },
  lawyer: {
    style: "luxury-authority",
    colors: {
      primary: "#78716c",
      secondary: "#1c1917",
      accent: "#d4af37",
      background: "#0c0a09",
      text: "#fafaf9",
      gradient: "from-stone-800 via-stone-900 to-black",
    },
    mood: "authoritative, trustworthy, premium, serious",
    animations: "elegant fade-ins, justice scales, subtle parallax",
    icons: "⚖️🏛️📜",
  },
  dentist: {
    style: "clean-calming",
    colors: {
      primary: "#06b6d4",
      secondary: "#0891b2",
      accent: "#a7f3d0",
      background: "#f0fdfa",
      text: "#134e4a",
      gradient: "from-cyan-400 via-teal-500 to-emerald-600",
    },
    mood: "clean, calming, professional, trustworthy",
    animations: "smile reveal, teeth sparkle, gentle float",
    icons: "🦷✨😊",
  },
  restaurant: {
    style: "cinematic-food",
    colors: {
      primary: "#dc2626",
      secondary: "#991b1b",
      accent: "#fbbf24",
      background: "#1c1917",
      text: "#fef3c7",
      gradient: "from-red-700 via-orange-800 to-stone-900",
    },
    mood: "warm, inviting, appetizing, premium dining",
    animations: "steam rising, food rotation, parallax hero",
    icons: "🍽️🔥👨‍🍳",
  },
  gym: {
    style: "high-energy-bold",
    colors: {
      primary: "#ef4444",
      secondary: "#b91c1c",
      accent: "#f97316",
      background: "#09090b",
      text: "#fafafa",
      gradient: "from-red-600 via-orange-600 to-yellow-500",
    },
    mood: "high energy, motivational, powerful, athletic",
    animations: "muscle pump, weight lift, dynamic text, power particles",
    icons: "💪🏋️⚡",
  },
  plumber: {
    style: "reliable-professional",
    colors: {
      primary: "#2563eb",
      secondary: "#1d4ed8",
      accent: "#22c55e",
      background: "#0f172a",
      text: "#f8fafc",
      gradient: "from-blue-600 via-blue-800 to-slate-900",
    },
    mood: "reliable, fast, emergency-ready, trustworthy",
    animations: "water flow, pipe animation, drip effect",
    icons: "🔧💧🚿",
  },
  realtor: {
    style: "luxury-modern",
    colors: {
      primary: "#8b5cf6",
      secondary: "#6d28d9",
      accent: "#f59e0b",
      background: "#09090b",
      text: "#fafafa",
      gradient: "from-violet-600 via-purple-700 to-indigo-900",
    },
    mood: "luxury, premium, aspirational, sophisticated",
    animations: "home reveal, map fly-in, property card flip",
    icons: "🏡✨🔑",
  },
  default: {
    style: "modern-saas",
    colors: {
      primary: "#6366f1",
      secondary: "#4f46e5",
      accent: "#06b6d4",
      background: "#09090b",
      text: "#fafafa",
      gradient: "from-indigo-600 via-purple-700 to-cyan-700",
    },
    mood: "modern, professional, trustworthy, innovative",
    animations: "smooth fade-ins, floating elements, gradient orbs",
    icons: "⭐🚀💡",
  },
};

function getNicheTheme(niche: string) {
  const lowerNiche = niche.toLowerCase();
  for (const [key, theme] of Object.entries(NICHE_THEMES)) {
    if (lowerNiche.includes(key)) return theme;
  }
  return NICHE_THEMES.default;
}

function getNicheServices(niche: string): string[] {
  const serviceMap: Record<string, string[]> = {
    hvac: ["AC Installation", "Heating Repair", "Emergency Service 24/7", "Maintenance Plans", "Duct Cleaning", "Air Quality Testing"],
    lawyer: ["Free Consultation", "Personal Injury", "Family Law", "Criminal Defense", "Business Law", "Estate Planning"],
    dentist: ["Teeth Whitening", "Invisalign", "Dental Implants", "Emergency Care", "General Cleanings", "Cosmetic Dentistry"],
    restaurant: ["Dine-In Experience", "Takeout & Delivery", "Private Events", "Catering Services", "Happy Hour Specials", "Seasonal Menus"],
    gym: ["Personal Training", "Group Classes", "Nutrition Coaching", "Online Programs", "Recovery Services", "Membership Plans"],
    plumber: ["Emergency Plumbing", "Drain Cleaning", "Pipe Repair", "Water Heater Service", "Bathroom Remodels", "Leak Detection"],
    realtor: ["Home Buying", "Home Selling", "Investment Properties", "Property Management", "Market Analysis", "Virtual Tours"],
  };

  const lowerNiche = niche.toLowerCase();
  for (const [key, services] of Object.entries(serviceMap)) {
    if (lowerNiche.includes(key)) return services;
  }

  return ["Professional Services", "Expert Consultation", "Quality Solutions", "Fast Turnaround", "24/7 Support", "Free Quote"];
}

export async function generateWebsite(input: WebsiteGenerationInput): Promise<GeneratedWebsite> {
  const theme = getNicheTheme(input.niche);
  const defaultServices = getNicheServices(input.niche);
  const services = input.services?.length ? input.services : defaultServices;

  const location = [input.city, input.state].filter(Boolean).join(", ");
  const reviewText = input.googleRating
    ? `${input.reviewCount ?? "Many"} 5-star reviews — rated ${input.googleRating}/5`
    : "Trusted local business";

  const systemPrompt = `You are an elite web designer who creates stunning, award-winning websites for local businesses.
Your websites look like they cost $10,000+. You write pixel-perfect HTML with inline Tailwind-style CSS (using <style> tags) and smooth animations.
Every website you create must be UNIQUE to the business's niche and feel like an Apple or Stripe-level product.
Use glassmorphism, smooth animations, and premium typography.
The business niche is: ${input.niche.toUpperCase()}
The mood/style should be: ${theme.mood}
Use this color palette: Primary ${theme.colors.primary}, Accent ${theme.colors.accent}`;

  const prompt = `Generate a complete, stunning single-page website for this business:

BUSINESS INFO:
- Name: ${input.businessName}
- Niche: ${input.niche}
- Location: ${location || "Local Area"}
- Phone: ${input.phone ?? "Call for pricing"}
- Email: ${input.email ?? "info@business.com"}
- Services: ${services.join(", ")}
- Social proof: ${reviewText}
- Owner: ${input.ownerName ?? "The Team"}

DESIGN REQUIREMENTS:
- Style: ${theme.style}
- Primary color: ${theme.colors.primary}
- Accent color: ${theme.colors.accent}
- Background: ${theme.colors.background} (dark luxury)
- Animations: ${theme.animations}
- Niche icons: ${theme.icons}

SECTIONS TO INCLUDE (in order):
1. Navigation bar (sticky, glassmorphism, logo + links + CTA button)
2. Hero section (full-screen, animated gradient background, bold headline, subheadline, 2 CTAs, animated element specific to the niche)
3. Trust badges bar (reviews, years in business, satisfaction guarantee, etc.)
4. Services grid (3x2 cards with hover animations, icons, descriptions)
5. Why Choose Us (3 columns with icons)
6. Testimonials slider (3 cards, glassmorphism cards)
7. Stats bar (years experience, clients served, satisfaction rate, response time)
8. Contact + CTA section (form + phone + map placeholder)
9. Footer (links, copyright, social icons)

COPY REQUIREMENTS:
- Headlines must be compelling and specific to the niche — NOT generic
- Use power words, urgency, and specific benefits
- Include local SEO keywords: "${input.niche} in ${location}"
- CTA buttons must create urgency

OUTPUT FORMAT:
Return ONLY valid, complete HTML (no explanation text). The HTML must:
- Include a <style> tag with all CSS animations and custom styles
- Use inline CSS for colors (since no Tailwind CDN is available in preview)
- Have smooth CSS animations (keyframes)
- Be mobile-responsive (use flexbox/grid)
- Look stunning when rendered in a browser

Make this website absolutely gorgeous. This should be a portfolio piece.`;

  const html = await generateWithClaude({
    system: systemPrompt,
    prompt,
    maxTokens: 8192,
  });

  // Extract tagline from generated content
  const taglineMatch = html.match(/<h1[^>]*>([^<]{10,80})<\/h1>/i);
  const tagline = taglineMatch?.[1]?.trim() ?? `${input.businessName} — ${input.niche} Experts`;

  return {
    html,
    colorScheme: theme.colors,
    tagline,
    services,
    seoTitle: `${input.businessName} | ${input.niche} in ${location}`,
    seoDescription: `${input.businessName} is ${location}'s premier ${input.niche} provider. ${reviewText}. Call today for a free quote!`,
    style: theme.style,
  };
}
