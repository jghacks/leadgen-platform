/**
 * Website Technology Detector
 * Analyzes a website URL to detect tech stack, CMS, performance signals, and AI readiness.
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface TechProfile {
  // Speed & SSL
  hasSSL: boolean;
  loadTimeMs?: number;
  statusCode?: number;

  // Mobile
  isMobileOptimized: boolean;
  hasViewportMeta: boolean;

  // CMS & Framework
  cmsDetected?: string;
  frameworkDetected?: string;
  techStack: string[];

  // Tracking & Analytics
  hasGoogleAnalytics: boolean;
  hasFacebookPixel: boolean;
  hasHotjar: boolean;
  hasAdPixel: boolean;
  hasAnalytics: boolean;

  // AI & Automation
  hasChatbot: boolean;
  hasLiveChat: boolean;
  hasAI: boolean;
  hasCRM: boolean;
  hasEmailMarketing: boolean;

  // Business Features
  hasOnlineBooking: boolean;
  hasEcommerce: boolean;
  hasSSLCertificate: boolean;
  hasContactForm: boolean;
  hasPhoneNumber: boolean;

  // SEO Basics
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  hasH1: boolean;
  hasSchema: boolean;
  hasOpenGraph: boolean;
  hasSitemap: boolean;
  hasRobots: boolean;

  // Quality signals
  isWordPress: boolean;
  hasBrokenLayout: boolean;
  websiteAge?: number;
  pageTitle?: string;
  metaDescription?: string;
  h1Text?: string;
}

const CHATBOT_SIGNATURES = [
  "intercom", "drift.com", "tidio", "tawk.to", "crisp.chat",
  "freshchat", "zendesk", "hubspot", "chatbase", "voiceflow",
  "manychat", "botpress", "landbot", "chatfuel", "typebot",
];

const AI_SIGNATURES = [
  "openai", "anthropic", "gpt", "chatgpt", "copilot",
  "jasper", "copy.ai", "writesonic", "midjourney", "stable-diffusion",
];

const BOOKING_SIGNATURES = [
  "calendly", "acuityscheduling", "booksy", "mindbody", "square",
  "schedulicity", "vagaro", "timely", "setmore", "simplybook",
  "opencart", "shopify", "woocommerce",
];

const CRM_SIGNATURES = [
  "salesforce", "hubspot", "pipedrive", "zoho", "freshsales",
  "monday.com", "close.com", "keap", "activecampaign",
];

const EMAIL_MARKETING_SIGNATURES = [
  "mailchimp", "klaviyo", "convertkit", "aweber", "getresponse",
  "constantcontact", "sendinblue", "drip", "activecampaign",
];

const CMS_SIGNATURES: [string, string][] = [
  ["wordpress", "WordPress"],
  ["wp-content", "WordPress"],
  ["wix.com", "Wix"],
  ["squarespace.com", "Squarespace"],
  ["webflow.io", "Webflow"],
  ["weebly.com", "Weebly"],
  ["shopify.com", "Shopify"],
  ["ghost.io", "Ghost"],
  ["drupal", "Drupal"],
  ["joomla", "Joomla"],
  ["contentful", "Contentful"],
  ["sanity.io", "Sanity"],
];

const FRAMEWORK_SIGNATURES: [string, string][] = [
  ["__next", "Next.js"],
  ["nuxt", "Nuxt.js"],
  ["gatsby", "Gatsby"],
  ["react", "React"],
  ["angular", "Angular"],
  ["vue", "Vue.js"],
  ["svelte", "Svelte"],
  ["remix", "Remix"],
];

export async function detectTech(websiteUrl: string): Promise<TechProfile> {
  const profile: TechProfile = {
    hasSSL: false,
    isMobileOptimized: false,
    hasViewportMeta: false,
    techStack: [],
    hasGoogleAnalytics: false,
    hasFacebookPixel: false,
    hasHotjar: false,
    hasAdPixel: false,
    hasAnalytics: false,
    hasChatbot: false,
    hasLiveChat: false,
    hasAI: false,
    hasCRM: false,
    hasEmailMarketing: false,
    hasOnlineBooking: false,
    hasEcommerce: false,
    hasSSLCertificate: false,
    hasContactForm: false,
    hasPhoneNumber: false,
    hasMetaTitle: false,
    hasMetaDescription: false,
    hasH1: false,
    hasSchema: false,
    hasOpenGraph: false,
    hasSitemap: false,
    hasRobots: false,
    isWordPress: false,
    hasBrokenLayout: false,
  };

  try {
    // Normalize URL
    const url = normalizeUrl(websiteUrl);
    profile.hasSSL = url.startsWith("https://");

    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LeadGenBot/1.0; +https://leadgen.ai/bot)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    });

    profile.loadTimeMs = Date.now() - startTime;
    profile.statusCode = response.status;

    const html = response.data as string;
    const $ = cheerio.load(html);
    const htmlLower = html.toLowerCase();

    // ── Meta & SEO ────────────────────────────────────────────
    const title = $("title").text().trim();
    profile.hasMetaTitle = title.length > 0;
    profile.pageTitle = title;

    const metaDesc = $('meta[name="description"]').attr("content") ?? "";
    profile.hasMetaDescription = metaDesc.length > 0;
    profile.metaDescription = metaDesc;

    const h1 = $("h1").first().text().trim();
    profile.hasH1 = h1.length > 0;
    profile.h1Text = h1;

    profile.hasOpenGraph = $('meta[property^="og:"]').length > 0;
    profile.hasSchema = html.includes("application/ld+json") || html.includes("schema.org");

    // Viewport meta (mobile readiness)
    const viewport = $('meta[name="viewport"]').attr("content") ?? "";
    profile.hasViewportMeta = viewport.includes("width=device-width");
    profile.isMobileOptimized = profile.hasViewportMeta;

    // ── CMS Detection ─────────────────────────────────────────
    for (const [sig, name] of CMS_SIGNATURES) {
      if (htmlLower.includes(sig)) {
        profile.cmsDetected = name;
        profile.techStack.push(name);
        if (name === "WordPress") profile.isWordPress = true;
        break;
      }
    }

    // ── Framework Detection ───────────────────────────────────
    for (const [sig, name] of FRAMEWORK_SIGNATURES) {
      if (htmlLower.includes(sig) && !profile.frameworkDetected) {
        profile.frameworkDetected = name;
        if (!profile.techStack.includes(name)) profile.techStack.push(name);
      }
    }

    // ── Analytics & Ads ───────────────────────────────────────
    if (htmlLower.includes("google-analytics") || htmlLower.includes("gtag") || htmlLower.includes("ua-")) {
      profile.hasGoogleAnalytics = true;
      profile.hasAnalytics = true;
      profile.techStack.push("Google Analytics");
    }

    if (htmlLower.includes("fbq") || htmlLower.includes("facebook.net/en_US/fbevents")) {
      profile.hasFacebookPixel = true;
      profile.hasAdPixel = true;
      profile.techStack.push("Facebook Pixel");
    }

    if (htmlLower.includes("hotjar")) {
      profile.hasHotjar = true;
      profile.hasAnalytics = true;
      profile.techStack.push("Hotjar");
    }

    // ── Chatbot / Live Chat ───────────────────────────────────
    for (const sig of CHATBOT_SIGNATURES) {
      if (htmlLower.includes(sig)) {
        profile.hasChatbot = true;
        profile.hasLiveChat = true;
        profile.techStack.push(`Chat: ${sig}`);
        break;
      }
    }

    // ── AI Detection ──────────────────────────────────────────
    for (const sig of AI_SIGNATURES) {
      if (htmlLower.includes(sig)) {
        profile.hasAI = true;
        break;
      }
    }

    // ── Online Booking ────────────────────────────────────────
    for (const sig of BOOKING_SIGNATURES) {
      if (htmlLower.includes(sig)) {
        profile.hasOnlineBooking = true;
        profile.techStack.push(`Booking: ${sig}`);
        break;
      }
    }

    if (htmlLower.includes("woocommerce") || htmlLower.includes("shopify") || htmlLower.includes("add-to-cart")) {
      profile.hasEcommerce = true;
    }

    // ── CRM ───────────────────────────────────────────────────
    for (const sig of CRM_SIGNATURES) {
      if (htmlLower.includes(sig)) {
        profile.hasCRM = true;
        break;
      }
    }

    // ── Email Marketing ───────────────────────────────────────
    for (const sig of EMAIL_MARKETING_SIGNATURES) {
      if (htmlLower.includes(sig)) {
        profile.hasEmailMarketing = true;
        break;
      }
    }

    // ── Contact Info ──────────────────────────────────────────
    profile.hasContactForm = $('form').length > 0 &&
      ($('input[type="email"]').length > 0 || $('input[name*="email"]').length > 0);
    profile.hasPhoneNumber = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(html);

    // ── Sitemap & Robots ──────────────────────────────────────
    try {
      const sitemapRes = await axios.head(`${url}/sitemap.xml`, { timeout: 3000 });
      profile.hasSitemap = sitemapRes.status === 200;
    } catch { /* ignore */ }

    try {
      const robotsRes = await axios.head(`${url}/robots.txt`, { timeout: 3000 });
      profile.hasRobots = robotsRes.status === 200;
    } catch { /* ignore */ }

    // Deduplicate tech stack
    profile.techStack = [...new Set(profile.techStack)];

  } catch (error) {
    console.error(`Tech detection failed for ${websiteUrl}:`, error);
    profile.hasBrokenLayout = true;
  }

  return profile;
}

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}
