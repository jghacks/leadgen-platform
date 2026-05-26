"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Zap, Globe, BarChart3, Mail, Phone, Star, ChevronDown,
  ArrowRight, Check, Sparkles, Target, Brain, TrendingUp,
  Shield, Clock, Users, DollarSign, Search, Play, X
} from "lucide-react";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Search,
    title: "AI Lead Scraper",
    description: "Pull verified leads from Google Maps, Yelp, BBB, and more. Every lead enriched with 40+ data points in seconds.",
    color: "from-blue-500 to-cyan-500",
    glow: "group-hover:shadow-cyan-500/30",
  },
  {
    icon: Target,
    title: "Reachability Scoring",
    description: "AI scores every lead 1–100. Know instantly who's a HOT LEAD vs. a waste of time. Never cold call blindly again.",
    color: "from-violet-500 to-purple-600",
    glow: "group-hover:shadow-violet-500/30",
  },
  {
    icon: Globe,
    title: "AI Website Generator",
    description: "Auto-build stunning website previews for each lead — niche-specific design, copy, and animations included.",
    color: "from-emerald-500 to-teal-500",
    glow: "group-hover:shadow-emerald-500/30",
  },
  {
    icon: Mail,
    title: "AI Email Sequences",
    description: "Hyper-personalized cold emails, follow-ups, and LinkedIn messages generated instantly from lead data.",
    color: "from-orange-500 to-amber-500",
    glow: "group-hover:shadow-orange-500/30",
  },
  {
    icon: Phone,
    title: "Cold Call Scripts",
    description: "Full call scripts, objection handling, voicemails, and closing lines tailored to every lead's pain points.",
    color: "from-pink-500 to-rose-500",
    glow: "group-hover:shadow-pink-500/30",
  },
  {
    icon: BarChart3,
    title: "Website Audit Engine",
    description: "Full Lighthouse audit with AI analysis — shows exactly what's broken and how much revenue they're losing.",
    color: "from-sky-500 to-indigo-500",
    glow: "group-hover:shadow-sky-500/30",
  },
];

const STATS = [
  { value: "2.4M+", label: "Businesses Scraped", icon: Search },
  { value: "89%", label: "Email Open Rate", icon: Mail },
  { value: "$2.3M", label: "Deals Closed by Users", icon: DollarSign },
  { value: "12min", label: "Avg. Time to First Lead", icon: Clock },
];

const TESTIMONIALS = [
  {
    name: "Marcus D.",
    role: "Agency Owner, Dallas TX",
    avatar: "MD",
    rating: 5,
    text: "I closed $14k in new clients in my first month using LeadForge. The AI call scripts alone are worth the subscription — I went from dreading cold calls to looking forward to them.",
    revenue: "$14,000 in month 1",
  },
  {
    name: "Sarah K.",
    role: "Web Design Freelancer",
    avatar: "SK",
    rating: 5,
    text: "The website previews are insane. I show the client what their new site could look like before they even sign. Closes deals like nothing I've tried before.",
    revenue: "3x conversion rate",
  },
  {
    name: "James T.",
    role: "Digital Marketing Agency",
    avatar: "JT",
    rating: 5,
    text: "We scrape 500+ leads per week for our agency. The reachability scoring saves us probably 20 hours a week that we used to spend qualifying manually.",
    revenue: "20 hrs/week saved",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: 97,
    description: "Perfect for solo freelancers",
    features: ["500 leads/month", "AI Email Generator", "Basic audit reports", "CRM pipeline", "Email support"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: 297,
    description: "For growing agencies",
    features: ["5,000 leads/month", "AI Website Generator", "Full audit engine", "Cold call scripts", "CRM + campaigns", "Priority support", "Vercel deploy"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: 797,
    description: "For teams doing $10k+/mo",
    features: ["Unlimited leads", "White-label reports", "Team seats (5)", "API access", "Custom AI training", "Dedicated CSM", "SLA guarantee"],
    cta: "Book a Demo",
    popular: false,
  },
];

const FAQS = [
  {
    q: "How does the AI lead scraper work?",
    a: "We pull data from Google Maps API, SerpAPI, and public directories. Every lead is automatically enriched — tech stack, SEO score, mobile performance, social profiles, and a custom AI reachability score.",
  },
  {
    q: "Is this compliant with Google's Terms of Service?",
    a: "Yes. We use official Google Maps/Places APIs, not scraping robots. All data is publicly available business information.",
  },
  {
    q: "How good are the generated websites?",
    a: "They're powered by Claude — the most capable AI model available. Each site is unique to the business niche, with proper copy, CTAs, animations, and mobile responsiveness. Clients are routinely amazed.",
  },
  {
    q: "Can I export the leads and outreach?",
    a: "Yes. Export leads as CSV, emails as templates, scripts as PDF, and website previews as production-ready HTML/CSS code.",
  },
  {
    q: "What's the refund policy?",
    a: "14-day money-back guarantee, no questions asked. If it doesn't work for you, we'll refund you immediately.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">LeadForge<span className="text-violet-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Results</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Powered by Claude + GPT-4o · Used by 2,400+ agencies</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Find Hot Leads.{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent bg-[size:200%] animate-[gradient-shift_3s_ease_infinite]">
              Close Them With AI.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            LeadForge scrapes local businesses, scores them with AI, audits their websites, generates custom website previews, and writes your cold outreach — all in under 5 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-7 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setVideoOpen(true)}
              className="flex items-center gap-2 px-7 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 text-violet-400" />
              Watch Demo (3 min)
            </button>
          </motion.div>

          {/* Social proof bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2">4.9/5 from 380+ reviews</span>
            </div>
            <span className="hidden sm:block w-px h-4 bg-zinc-700" />
            <span>No credit card required</span>
            <span className="hidden sm:block w-px h-4 bg-zinc-700" />
            <span>14-day free trial</span>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
              {/* Mock dashboard */}
              <div className="bg-[#0d0d14] p-1">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <div className="ml-4 flex-1 h-5 rounded bg-white/5 flex items-center px-3">
                    <span className="text-[10px] text-zinc-600">app.leadforge.ai/dashboard</span>
                  </div>
                </div>
                {/* Dashboard content preview */}
                <div className="p-4 grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Hot Leads", value: "47", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Emails Sent", value: "128", color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Sites Generated", value: "23", color: "text-violet-400", bg: "bg-violet-500/10" },
                    { label: "Pipeline Value", value: "$84k", color: "text-amber-400", bg: "bg-amber-500/10" },
                  ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-xl p-3`}>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 px-1 pb-2">
                  {["Mike's HVAC — Dallas", "Smith Law Group — Austin", "Peak Performance Gym"].map((name, i) => (
                    <div key={name} className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5">
                      <div className="text-[11px] font-medium text-white truncate">{name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${i === 0 ? "bg-emerald-500/20 text-emerald-400" : i === 1 ? "bg-yellow-500/20 text-yellow-400" : "bg-orange-500/20 text-orange-400"}`}>
                          {i === 0 ? "🔥 HOT" : i === 1 ? "⭐ LIKELY" : "📊 MEDIUM"}
                        </div>
                        <div className="text-[9px] text-zinc-600">Score: {[91, 73, 56][i]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow behind preview */}
            <div className="absolute -inset-4 bg-violet-500/5 blur-3xl rounded-3xl -z-10" />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600"
        >
          <span className="text-xs">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-28 max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs mb-4">
            <Brain className="w-3.5 h-3.5" />
            Everything You Need to Close Deals
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            The complete AI outreach<br />stack for agencies
          </motion.h2>
          <motion.p variants={fadeUp} className="text-zinc-400 max-w-xl mx-auto">
            Stop duct-taping tools together. LeadForge is an end-to-end system — from finding the lead to closing the deal.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className={`group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.glow}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-5`}>
                <div className="w-full h-full rounded-[10px] bg-[#0d0d14] flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">From 0 to signed deal in one afternoon</motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400">Here's the exact workflow our users follow to close $3k–$10k deals.</motion.p>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-transparent hidden md:block" />

            <div className="space-y-6">
              {[
                { step: "01", title: "Type any business niche + city", desc: "HVAC contractors in Austin TX. Divorce lawyers in Miami. Restaurants in Nashville. Any niche, any city.", icon: Search },
                { step: "02", title: "AI scrapes and scores 50+ leads", desc: "Every lead gets a reachability score, tech stack analysis, SEO audit, and opportunity breakdown automatically.", icon: Brain },
                { step: "03", title: "Click a hot lead to generate the pitch", desc: "One click generates a custom website preview, cold email sequence, and call script — all personalized to that business.", icon: Sparkles },
                { step: "04", title: "Reach out and close", desc: "Send the email, make the call with the script, show them the website preview. Most agencies close 20–40% of hot leads.", icon: TrendingUp },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="flex gap-6 items-start"
                >
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-violet-300" />
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold text-zinc-600 bg-[#09090b] border border-white/5 px-1.5 py-0.5 rounded-full">{item.step}</span>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-semibold text-white text-lg mb-1">{item.title}</h3>
                    <p className="text-zinc-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">Real agencies. Real revenue.</motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400">Don't take our word for it — here's what's happening in the wild.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{t.name}</div>
                      <div className="text-xs text-zinc-600">{t.role}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                    {t.revenue}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 border-t border-white/5 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              Pricing that scales with you
            </motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400">
              One closed deal from LeadForge pays for 6–12 months of subscription.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`relative p-6 rounded-2xl border transition-all ${
                  plan.popular
                    ? "bg-gradient-to-b from-violet-600/10 to-transparent border-violet-500/40 shadow-lg shadow-violet-500/10"
                    : "bg-white/[0.03] border-white/[0.07]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-white text-xl mb-1">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-zinc-500">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-zinc-600 text-sm mt-6 flex items-center justify-center gap-4"
          >
            <Shield className="w-4 h-4" />
            14-day money-back guarantee · No contracts · Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-4xl font-bold text-center mb-12"
          >
            Common questions
          </motion.h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="border border-white/[0.07] rounded-xl overflow-hidden bg-white/[0.02]"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-white text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-violet-400 text-sm mb-6">
              <Users className="w-4 h-4" />
              Join 2,400+ agencies already using LeadForge
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Ready to fill your<br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                pipeline with AI?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400 mb-8 text-lg">
              Start your 14-day free trial. No credit card required.
              Cancel anytime. First lead in under 5 minutes.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all duration-300 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
              >
                Start Closing Deals Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-600 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-zinc-400">LeadForge AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Contact</a>
          </div>
          <span>© 2025 LeadForge AI. All rights reserved.</span>
        </div>
      </footer>

      {/* ── Video Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-900 rounded-2xl overflow-hidden w-full max-w-3xl aspect-video border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-zinc-500">Demo video coming soon</span>
              </div>
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
