"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  Search, Zap, MapPin, Star, Globe, Brain, Filter,
  ChevronRight, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type JobStatus = "idle" | "running" | "completed" | "failed";

const NICHE_PRESETS = [
  { label: "HVAC", icon: "❄️", niche: "HVAC contractors" },
  { label: "Lawyers", icon: "⚖️", niche: "law firms" },
  { label: "Dentists", icon: "🦷", niche: "dental offices" },
  { label: "Restaurants", icon: "🍽️", niche: "restaurants" },
  { label: "Gyms", icon: "💪", niche: "fitness gyms" },
  { label: "Plumbers", icon: "🔧", niche: "plumbing services" },
  { label: "Realtors", icon: "🏡", niche: "real estate agents" },
  { label: "Roofers", icon: "🏠", niche: "roofing contractors" },
];

export default function ScraperPage() {
  const [form, setForm] = useState({
    niche: "",
    location: "",
    radius: 25,
    minReviews: 0,
    requireWebsite: false,
    requireEmail: false,
    outdatedWebsiteOnly: false,
    aiOpportunityOnly: false,
    maxResults: 50,
  });

  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalFound, setTotalFound] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.niche || !form.location) {
      toast.error("Please enter a business type and location");
      return;
    }

    setJobStatus("running");
    setProgress(0);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Scrape failed");
      const data = await res.json();
      setJobId(data.jobId);

      // Poll for progress
      const poll = setInterval(async () => {
        const statusRes = await fetch(`/api/scrape?jobId=${data.jobId}`);
        const statusData = await statusRes.json();
        setProgress(statusData.job?.progress ?? 0);
        setTotalFound(statusData.job?.totalFound ?? 0);

        if (statusData.job?.status === "COMPLETED") {
          clearInterval(poll);
          setJobStatus("completed");
          setProgress(100);
          toast.success(`✅ Found ${statusData.job.totalFound} leads!`);
        } else if (statusData.job?.status === "FAILED") {
          clearInterval(poll);
          setJobStatus("failed");
          toast.error("Scrape job failed. Please try again.");
        }
      }, 2000);
    } catch (err) {
      setJobStatus("failed");
      toast.error("Failed to start scrape job");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Lead Scraper" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Hero header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs mb-3">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Lead Discovery
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Find your next clients</h2>
            <p className="text-zinc-500 text-sm">Type any business niche and city — we'll scrape, enrich, and score every lead with AI.</p>
          </motion.div>

          {/* Niche presets */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {NICHE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setForm({ ...form, niche: preset.niche })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border ${
                  form.niche === preset.niche
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{preset.icon}</span>
                {preset.label}
              </button>
            ))}
          </motion.div>

          {/* Main form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Business Type / Niche
                </label>
                <input
                  type="text"
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="e.g. HVAC contractors, divorce lawyers, dentists"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> City / Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Austin TX, Dallas TX, Miami FL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400">Radius (miles)</label>
                <select
                  value={form.radius}
                  onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50"
                >
                  {[5, 10, 25, 50, 100].map((r) => (
                    <option key={r} value={r} className="bg-zinc-900">{r} miles</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" /> Min. Reviews
                </label>
                <input
                  type="number"
                  value={form.minReviews}
                  onChange={(e) => setForm({ ...form, minReviews: Number(e.target.value) })}
                  min={0}
                  max={500}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400">Max Results</label>
                <select
                  value={form.maxResults}
                  onChange={(e) => setForm({ ...form, maxResults: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/50"
                >
                  {[20, 50, 100].map((n) => (
                    <option key={n} value={n} className="bg-zinc-900">{n} leads</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced filters toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              Advanced Filters
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-90" : ""}`} />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { key: "requireWebsite", label: "Has website", icon: Globe },
                      { key: "requireEmail", label: "Has email", icon: Search },
                      { key: "outdatedWebsiteOnly", label: "Outdated website", icon: AlertCircle },
                      { key: "aiOpportunityOnly", label: "No AI tools", icon: Brain },
                    ].map((f) => (
                      <label
                        key={f.key}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          form[f.key as keyof typeof form]
                            ? "bg-violet-500/10 border-violet-500/30"
                            : "bg-white/[0.02] border-white/[0.08] hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form[f.key as keyof typeof form] as boolean}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                          className="sr-only"
                        />
                        <f.icon className={`w-4 h-4 ${form[f.key as keyof typeof form] ? "text-violet-400" : "text-zinc-600"}`} />
                        <span className={`text-sm ${form[f.key as keyof typeof form] ? "text-violet-300" : "text-zinc-500"}`}>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={jobStatus === "running"}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              {jobStatus === "running" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Scraping...</>
              ) : (
                <><Search className="w-4 h-4" /> Find Leads with AI</>
              )}
            </button>
          </motion.form>

          {/* Progress card */}
          <AnimatePresence>
            {jobStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-5 rounded-2xl border ${
                  jobStatus === "completed" ? "bg-emerald-500/5 border-emerald-500/20" :
                  jobStatus === "failed" ? "bg-red-500/5 border-red-500/20" :
                  "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {jobStatus === "running" && <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />}
                  {jobStatus === "completed" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  {jobStatus === "failed" && <AlertCircle className="w-5 h-5 text-red-400" />}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {jobStatus === "running" && `Scraping ${form.niche} in ${form.location}...`}
                      {jobStatus === "completed" && `Found ${totalFound} leads!`}
                      {jobStatus === "failed" && "Scrape job failed"}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {jobStatus === "running" && "Collecting data, detecting tech stack, scoring leads..."}
                      {jobStatus === "completed" && "All leads scored with AI reachability. Ready to view."}
                      {jobStatus === "failed" && "Check your API keys and try again."}
                    </p>
                  </div>
                </div>

                {(jobStatus === "running" || jobStatus === "completed") && (
                  <>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-600">
                      <span>{progress}% complete</span>
                      {totalFound > 0 && <span>{totalFound} businesses found so far</span>}
                    </div>
                  </>
                )}

                {jobStatus === "completed" && (
                  <a
                    href="/dashboard/leads"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium"
                  >
                    View all leads <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info cards */}
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { icon: "🔍", title: "40+ Data Points", desc: "Tech stack, SEO score, mobile, chatbot, booking, AI tools and more" },
              { icon: "🧠", title: "AI Scoring", desc: "Every lead scored 1-100 with HOT/LIKELY/MEDIUM/LOW classification" },
              { icon: "⚡", title: "Under 5 Minutes", desc: "From search to scored, enriched leads ready for outreach" },
            ].map((card) => (
              <div key={card.title} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-sm font-medium text-white mb-1">{card.title}</div>
                <div className="text-xs text-zinc-600">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
