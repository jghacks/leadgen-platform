"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Globe, ExternalLink, RefreshCw, Download, Zap, Plus, Eye } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const SAMPLE_SITES = [
  { id: "1", business: "Mike's HVAC Services",   niche: "HVAC",       status: "READY",    style: "modern", deployedUrl: null, updatedAt: "2 hours ago" },
  { id: "2", business: "Smith & Associates Law",  niche: "Lawyer",     status: "READY",    style: "luxury", deployedUrl: "https://smithlaw.vercel.app", updatedAt: "1 day ago" },
  { id: "3", business: "Sunrise Dental Care",     niche: "Dentist",    status: "READY",    style: "clean",  deployedUrl: null, updatedAt: "3 days ago" },
  { id: "4", business: "Peak Performance Gym",    niche: "Gym",        status: "GENERATING", style: "bold", deployedUrl: null, updatedAt: "Just now" },
  { id: "5", business: "Bella Cucina",            niche: "Restaurant", status: "DEPLOYED", style: "cinematic", deployedUrl: "https://bellacucina.vercel.app", updatedAt: "5 days ago" },
];

const STATUS_CONFIG = {
  READY:      { label: "Ready",      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  GENERATING: { label: "Generating", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  DEPLOYED:   { label: "Deployed",   color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  ARCHIVED:   { label: "Archived",   color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
};

const NICHE_PREVIEW_COLORS: Record<string, string> = {
  HVAC:       "from-sky-600 to-slate-800",
  Lawyer:     "from-stone-700 to-black",
  Dentist:    "from-cyan-400 to-teal-600",
  Gym:        "from-red-600 to-orange-700",
  Restaurant: "from-red-700 to-stone-900",
};

export default function WebsitesPage() {
  const [sites] = useState(SAMPLE_SITES);
  const [previewId, setPreviewId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="AI Websites" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Generated Websites</h2>
            <p className="text-zinc-500 text-sm mt-0.5">AI-generated website previews for your leads</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Generate from Lead
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Generated", value: sites.length, color: "text-violet-400" },
            { label: "Deployed", value: sites.filter((s) => s.deployedUrl).length, color: "text-blue-400" },
            { label: "Exported", value: 8, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Website grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sites.map((site, i) => {
            const gradColors = NICHE_PREVIEW_COLORS[site.niche] ?? "from-violet-600 to-indigo-800";
            const statusCfg = STATUS_CONFIG[site.status as keyof typeof STATUS_CONFIG];

            return (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden hover:border-white/10 transition-all group"
              >
                {/* Website preview thumbnail */}
                <div className={cn("h-40 bg-gradient-to-br relative overflow-hidden", gradColors)}>
                  {/* Fake browser chrome */}
                  <div className="absolute inset-x-0 top-0 h-6 bg-black/40 flex items-center px-2 gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" />
                    <div className="ml-2 flex-1 h-2.5 rounded-sm bg-white/10 text-[7px] text-white/30 flex items-center px-1 truncate">
                      {site.business.toLowerCase().replace(/\s+/g, "")}.com
                    </div>
                  </div>
                  {/* Mock website content */}
                  <div className="pt-8 px-3 space-y-1.5">
                    <div className="h-3 bg-white/30 rounded w-2/3" />
                    <div className="h-2 bg-white/15 rounded w-1/2" />
                    <div className="h-2 bg-white/15 rounded w-3/4" />
                    <div className="mt-2 flex gap-1.5">
                      <div className="h-5 bg-white/40 rounded px-2 w-16" />
                      <div className="h-5 bg-white/10 border border-white/20 rounded px-2 w-16" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewId(previewId === site.id ? null : site.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white text-xs font-semibold">
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{site.business}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-600">{site.niche}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", statusCfg.color)}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                    {site.deployedUrl ? (
                      <a href={site.deployedUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Live
                      </a>
                    ) : (
                      <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs font-medium hover:bg-violet-600/30 transition-colors">
                        <Zap className="w-3 h-3" /> Deploy
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-700">Updated {site.updatedAt}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
