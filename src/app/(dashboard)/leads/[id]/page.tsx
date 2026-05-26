"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  Globe, Phone, Mail, Star, MapPin, Shield, Smartphone,
  Bot, Calendar, BarChart2, Zap, RefreshCw, Download,
  ChevronLeft, ExternalLink, Loader2, CheckCircle,
  AlertTriangle, XCircle, Copy, Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Tab = "overview" | "audit" | "website" | "email" | "script";

const TIER_CONFIG = {
  HOT_LEAD:     { label: "🔥 HOT LEAD",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  VERY_LIKELY:  { label: "⭐ VERY LIKELY",  color: "text-amber-400 bg-amber-500/10 border-amber-500/20"    },
  MEDIUM:       { label: "📊 MEDIUM",       color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  LOW_PRIORITY: { label: "🔵 LOW",          color: "text-red-400 bg-red-500/10 border-red-500/20"          },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-zinc-400 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function TechTag({ label, active, positiveIfActive = true }: { label: string; active: boolean; positiveIfActive?: boolean }) {
  const positive = positiveIfActive ? active : !active;
  return (
    <div className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border", positive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>
      {positive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </div>
  );
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Generation states
  const [auditLoading, setAuditLoading] = useState(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  const [audit, setAudit] = useState<Record<string, unknown> | null>(null);
  const [website, setWebsite] = useState<Record<string, unknown> | null>(null);
  const [emails, setEmails] = useState<Record<string, string> | null>(null);
  const [script, setScript] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(`/api/leads/${id}`);
        const data = await res.json();
        setLead(data);
        if (data.audit) setAudit(data.audit);
        if (data.generatedWebsite) setWebsite(data.generatedWebsite);
      } catch { toast.error("Failed to load lead"); }
      finally { setLoading(false); }
    };
    fetchLead();
  }, [id]);

  const runAudit = async () => {
    setAuditLoading(true);
    setActiveTab("audit");
    try {
      const res = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id }) });
      const data = await res.json();
      setAudit(data.audit);
      toast.success("Audit complete!");
    } catch { toast.error("Audit failed"); }
    finally { setAuditLoading(false); }
  };

  const generateWebsite = async (regenerate = false) => {
    setWebsiteLoading(true);
    setActiveTab("website");
    try {
      const res = await fetch("/api/generate/website", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, regenerate }) });
      const data = await res.json();
      setWebsite(data.website);
      toast.success("Website generated!");
    } catch { toast.error("Generation failed"); }
    finally { setWebsiteLoading(false); }
  };

  const generateEmails = async () => {
    setEmailLoading(true);
    setActiveTab("email");
    try {
      const res = await fetch("/api/generate/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id }) });
      const data = await res.json();
      setEmails(data.emails);
      toast.success("Email sequence generated!");
    } catch { toast.error("Email generation failed"); }
    finally { setEmailLoading(false); }
  };

  const generateScript = async () => {
    setScriptLoading(true);
    setActiveTab("script");
    try {
      const res = await fetch("/api/generate/script", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id }) });
      const data = await res.json();
      setScript(data.script);
      toast.success("Call script generated!");
    } catch { toast.error("Script generation failed"); }
    finally { setScriptLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-600">Lead not found</p>
        </div>
      </div>
    );
  }

  const tier = lead.reachabilityTier as keyof typeof TIER_CONFIG | null;
  const tierCfg = tier ? TIER_CONFIG[tier] : null;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "audit", label: "Website Audit", icon: "🔍" },
    { id: "website", label: "AI Website", icon: "🌐" },
    { id: "email", label: "Cold Emails", icon: "✉️" },
    { id: "script", label: "Call Script", icon: "📞" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />

      <div className="flex-1 overflow-y-auto">
        {/* Lead header */}
        <div className="p-6 border-b border-white/[0.06] bg-[#0a0a12]">
          <Link href="/dashboard/leads" className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-400 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to leads
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                {(lead.niche as string)?.includes("HVAC") ? "❄️" : (lead.niche as string)?.includes("law") ? "⚖️" : (lead.niche as string)?.includes("dent") ? "🦷" : (lead.niche as string)?.includes("gym") ? "💪" : "🏢"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{lead.businessName as string}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  {tierCfg && (
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", tierCfg.color)}>
                      {tierCfg.label}
                    </span>
                  )}
                  {lead.reachabilityScore != null && (
                    <span className="text-xs text-zinc-500">Score: <span className="text-white font-bold">{lead.reachabilityScore as number}/100</span></span>
                  )}
                  {lead.niche && <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{lead.niche as string}</span>}
                  {lead.city && <span className="text-xs text-zinc-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.city as string}{lead.state ? `, ${lead.state as string}` : ""}</span>}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={runAudit} disabled={auditLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50">
                {auditLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BarChart2 className="w-3.5 h-3.5" />}
                Audit Site
              </button>
              <button onClick={() => generateWebsite()} disabled={websiteLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50">
                {websiteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                Gen Website
              </button>
              <button onClick={generateEmails} disabled={emailLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50">
                {emailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Gen Emails
              </button>
              <button onClick={generateScript} disabled={scriptLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors disabled:opacity-50">
                {scriptLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                Gen Script
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn("flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ── OVERVIEW ─────────────────────────────────────── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid lg:grid-cols-3 gap-6"
              >
                {/* Contact info */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <h3 className="font-semibold text-white text-sm">Contact Info</h3>
                    {lead.phone && (
                      <a href={`tel:${lead.phone as string}`} className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition-colors group">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        {lead.phone as string}
                        <CopyButton text={lead.phone as string} />
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email as string}`} className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="truncate">{lead.email as string}</span>
                        <CopyButton text={lead.email as string} />
                      </a>
                    )}
                    {lead.website && (
                      <a href={lead.website as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
                        <Globe className="w-4 h-4 text-violet-400" />
                        <span className="truncate">{(lead.website as string).replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                    {lead.address && (
                      <div className="flex items-start gap-2.5 text-sm text-zinc-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {lead.address as string}
                      </div>
                    )}
                    {lead.googleRating && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>{lead.googleRating as number} rating</span>
                        <span className="text-zinc-700">({lead.reviewCount as number} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tech stack */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <h3 className="font-semibold text-white text-sm mb-4">Website Health</h3>
                    <div className="flex flex-wrap gap-2">
                      <TechTag label="SSL" active={lead.hasSSL as boolean ?? false} />
                      <TechTag label="Mobile" active={lead.isMobileOptimized as boolean ?? false} />
                      <TechTag label="Chatbot" active={lead.hasChatbot as boolean ?? false} />
                      <TechTag label="Booking" active={lead.hasOnlineBooking as boolean ?? false} />
                      <TechTag label="AI Tools" active={lead.hasAI as boolean ?? false} />
                      <TechTag label="Analytics" active={lead.hasAnalytics as boolean ?? false} />
                      <TechTag label="CRM" active={lead.hasCRM as boolean ?? false} />
                      <TechTag label="Email Mktg" active={lead.hasEmailMarketing as boolean ?? false} />
                    </div>

                    {lead.seoScore != null && (
                      <div className="mt-4 space-y-3">
                        <ScoreBar label="SEO Score" score={lead.seoScore as number} color="#6366f1" />
                        {lead.performanceScore != null && (
                          <ScoreBar label="Performance" score={lead.performanceScore as number} color="#06b6d4" />
                        )}
                        {lead.reachabilityScore != null && (
                          <ScoreBar label="Reachability" score={lead.reachabilityScore as number} color="#10b981" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Opportunities */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="font-semibold text-white text-sm mb-4">AI Opportunities</h3>
                  <div className="space-y-2">
                    {[
                      !lead.hasChatbot && "Add AI chatbot for 24/7 lead capture",
                      !lead.hasOnlineBooking && "Set up online booking system",
                      !lead.isMobileOptimized && "Mobile-optimize the website",
                      !lead.hasSSL && "Add SSL certificate",
                      !lead.hasAI && "Implement AI automation tools",
                      !lead.hasCRM && "Deploy a CRM system",
                      (lead.reviewCount as number ?? 0) < 20 && "Run a review generation campaign",
                    ].filter(Boolean).slice(0, 6).map((op, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-zinc-500">
                        <Zap className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                        {op as string}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                    <button onClick={() => generateEmails()} className="flex-1 text-center py-2 px-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs font-medium hover:bg-violet-600/30 transition-colors">
                      Write Cold Email
                    </button>
                    <button onClick={() => generateScript()} className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition-colors">
                      Call Script
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── AUDIT ─────────────────────────────────────────── */}
            {activeTab === "audit" && (
              <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {auditLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    <p className="text-zinc-500">Running full website audit...</p>
                  </div>
                )}
                {!auditLoading && !audit && (
                  <div className="text-center py-20">
                    <BarChart2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 mb-4">No audit yet — run one to see issues and opportunities</p>
                    <button onClick={runAudit} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium">
                      Run Website Audit
                    </button>
                  </div>
                )}
                {!auditLoading && audit && (
                  <div className="space-y-6">
                    {/* Score summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Performance", score: audit.performanceScore as number ?? 0, color: "#6366f1" },
                        { label: "SEO", score: audit.seoScore as number ?? 0, color: "#06b6d4" },
                        { label: "Accessibility", score: audit.accessibilityScore as number ?? 0, color: "#10b981" },
                        { label: "Best Practices", score: audit.bestPracticesScore as number ?? 0, color: "#f59e0b" },
                      ].map((s) => (
                        <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                          <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.score}</div>
                          <div className="text-xs text-zinc-600">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* AI Summary */}
                    {audit.aiSummary && (
                      <div className="p-5 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-semibold text-violet-400">AI Summary</span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{audit.aiSummary as string}</p>
                        {audit.estimatedRevenueImpact && (
                          <div className="mt-3 text-sm font-semibold text-emerald-400">
                            💰 Estimated Revenue Impact: {audit.estimatedRevenueImpact as string}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── WEBSITE ───────────────────────────────────────── */}
            {activeTab === "website" && (
              <motion.div key="website" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {websiteLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                      <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-violet-500/20 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">Generating website for {lead.businessName as string}...</p>
                      <p className="text-zinc-500 text-sm mt-1">Claude is crafting a custom design for this business niche</p>
                    </div>
                  </div>
                )}
                {!websiteLoading && !website && (
                  <div className="text-center py-20">
                    <Globe className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 mb-4">Generate a custom website preview for this business</p>
                    <button onClick={() => generateWebsite()} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium">
                      Generate AI Website
                    </button>
                  </div>
                )}
                {!websiteLoading && website && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Generated Website Preview</h3>
                        <p className="text-xs text-zinc-600 mt-0.5">Custom design for {lead.niche as string} niche</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => generateWebsite(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([website.homepageHtml as string], { type: "text/html" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a"); a.href = url; a.download = `${lead.businessName as string}-website.html`; a.click();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm text-white font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Export HTML
                        </button>
                      </div>
                    </div>
                    {/* Browser frame */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white shadow-2xl">
                      <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 border-b border-gray-200">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <div className="ml-4 flex-1 text-xs text-gray-500 bg-white rounded px-3 py-1">
                          {(lead.businessName as string)?.toLowerCase().replace(/\s+/g, "")}.com
                        </div>
                      </div>
                      <iframe
                        srcDoc={website.homepageHtml as string}
                        className="w-full h-[600px] border-0"
                        sandbox="allow-scripts"
                        title="Website Preview"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── EMAIL ─────────────────────────────────────────── */}
            {activeTab === "email" && (
              <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {emailLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    <p className="text-zinc-500">Crafting personalized email sequence...</p>
                  </div>
                )}
                {!emailLoading && !emails && (
                  <div className="text-center py-20">
                    <Mail className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 mb-4">Generate a personalized cold email sequence</p>
                    <button onClick={generateEmails} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium">
                      Generate Email Sequence
                    </button>
                  </div>
                )}
                {!emailLoading && emails && (
                  <div className="space-y-4">
                    {[
                      { key: "subject", label: "Subject Line", icon: "💬" },
                      { key: "body", label: "Initial Cold Email", icon: "✉️" },
                      { key: "followUp1", label: "Follow-up #1 (Day 3)", icon: "📩" },
                      { key: "followUp2", label: "Follow-up #2 (Day 7)", icon: "📩" },
                      { key: "followUp3", label: "Breakup Email (Day 14)", icon: "👋" },
                      { key: "smsVariant", label: "SMS Version", icon: "💬" },
                    ].map(({ key, label, icon }) => (
                      <div key={key} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                            {icon} {label}
                          </span>
                          <CopyButton text={emails[key] ?? ""} />
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{emails[key]}</p>
                      </div>
                    ))}
                    <button onClick={generateEmails} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate all
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SCRIPT ─────────────────────────────────────────── */}
            {activeTab === "script" && (
              <motion.div key="script" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {scriptLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    <p className="text-zinc-500">Crafting high-ticket call script...</p>
                  </div>
                )}
                {!scriptLoading && !script && (
                  <div className="text-center py-20">
                    <Phone className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 mb-4">Generate a personalized cold call script</p>
                    <button onClick={generateScript} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium">
                      Generate Call Script
                    </button>
                  </div>
                )}
                {!scriptLoading && script && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: "opener", label: "🎯 Opener (First 15 sec)", color: "border-violet-500/20 bg-violet-500/5" },
                      { key: "pitch", label: "💬 Core Pitch (60 sec)", color: "border-blue-500/20 bg-blue-500/5" },
                      { key: "voicemailScript", label: "📱 Voicemail Script", color: "border-cyan-500/20 bg-cyan-500/5" },
                      { key: "closingScript", label: "🤝 Closing & Book Call", color: "border-emerald-500/20 bg-emerald-500/5" },
                      { key: "roiPitch", label: "💰 ROI Pitch", color: "border-amber-500/20 bg-amber-500/5" },
                      { key: "aiReceptionistPitch", label: "🤖 AI Receptionist Pitch", color: "border-pink-500/20 bg-pink-500/5" },
                      { key: "websiteRedesignPitch", label: "🌐 Website Redesign Pitch", color: "border-orange-500/20 bg-orange-500/5" },
                    ].map(({ key, label, color }) => (
                      <div key={key} className={`p-4 rounded-xl border ${color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-zinc-500">{label}</span>
                          <CopyButton text={script[key] as string ?? ""} />
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{script[key] as string}</p>
                      </div>
                    ))}

                    {/* Objection handling */}
                    {script.objectionHandling && (
                      <div className="md:col-span-2 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                        <h4 className="text-sm font-semibold text-white mb-3">⚔️ Objection Handling</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {Object.entries(script.objectionHandling as Record<string, string>).map(([obj, response]) => (
                            <div key={obj} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                              <div className="text-xs font-semibold text-red-400 mb-1.5">"{obj}"</div>
                              <p className="text-xs text-zinc-400 leading-relaxed">{response}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
