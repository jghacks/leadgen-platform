"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  Search, Filter, Star, Globe, Phone, Mail, ChevronRight,
  ExternalLink, Zap, RefreshCw, Download, Loader2,
  SortDesc, Eye, MapPin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Lead, ReachabilityTier } from "@/types/lead";
import { toast } from "sonner";

const TIER_CONFIG: Record<ReachabilityTier, { label: string; color: string; dot: string }> = {
  HOT_LEAD:     { label: "🔥 HOT LEAD",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  VERY_LIKELY:  { label: "⭐ VERY LIKELY",  color: "text-amber-400 bg-amber-500/10 border-amber-500/30",    dot: "bg-amber-400"   },
  MEDIUM:       { label: "📊 MEDIUM",       color: "text-orange-400 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-400"  },
  LOW_PRIORITY: { label: "🔵 LOW",          color: "text-red-400 bg-red-500/10 border-red-500/30",          dot: "bg-red-400"     },
};

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#f59e0b" : score >= 35 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

function TechBadge({ label, active }: { label: string; active?: boolean }) {
  if (!active) return null;
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{label}</span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/[0.04] animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/4" />
      </div>
      <div className="hidden md:flex gap-2">
        <div className="h-5 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="w-8 h-8 rounded-lg bg-white/5" />
      <div className="w-16 h-3 bg-white/5 rounded" />
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<ReachabilityTier | "ALL">("ALL");
  const [starredOnly, setStarredOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<"reachabilityScore" | "createdAt">("reachabilityScore");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        sortBy,
        sortOrder: "desc",
        ...(search && { search }),
        ...(tierFilter !== "ALL" && { tier: tierFilter }),
        ...(starredOnly && { isStarred: "true" }),
      });

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, search, tierFilter, starredOnly, sortBy]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const toggleStar = async (lead: Lead) => {
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred: !lead.isStarred }),
    });
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, isStarred: !l.isStarred } : l));
  };

  const exportCSV = () => {
    const headers = ["Business", "Niche", "City", "Phone", "Email", "Website", "Score", "Tier", "Google Rating"];
    const rows = leads.map((l) => [
      l.businessName, l.niche, l.city ?? "", l.phone ?? "", l.email ?? "",
      l.website ?? "", l.reachabilityScore ?? "", l.reachabilityTier ?? "", l.googleRating ?? ""
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="All Leads" />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex-shrink-0 p-4 border-b border-white/[0.06] space-y-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search by business, city, niche..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-400 focus:outline-none"
            >
              <option value="reachabilityScore" className="bg-zinc-900">By Score</option>
              <option value="createdAt" className="bg-zinc-900">By Date</option>
            </select>

            {/* Starred filter */}
            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className={cn("p-2 rounded-xl border transition-colors", starredOnly ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-400")}
            >
              <Star className="w-4 h-4" />
            </button>

            {/* Export */}
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-zinc-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh */}
            <button onClick={fetchLeads} className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-500 hover:text-white transition-colors">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Tier filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => { setTierFilter("ALL"); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 border", tierFilter === "ALL" ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-transparent text-zinc-600 hover:text-zinc-400")}
            >
              All ({total})
            </button>
            {(Object.keys(TIER_CONFIG) as ReachabilityTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => { setTierFilter(tier); setPage(1); }}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border", tierFilter === tier ? TIER_CONFIG[tier].color : "bg-transparent border-transparent text-zinc-600 hover:text-zinc-400")}
              >
                {TIER_CONFIG[tier].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div>{[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
              <Zap className="w-10 h-10 mb-3" />
              <p className="font-medium">No leads found</p>
              <p className="text-sm mt-1">Run a scrape job to start finding leads</p>
              <Link href="/dashboard/scraper" className="mt-4 text-sm text-violet-400 hover:text-violet-300">
                Go to Scraper →
              </Link>
            </div>
          ) : (
            <div>
              {leads.map((lead, i) => {
                const tier = lead.reachabilityTier;
                const tierCfg = tier ? TIER_CONFIG[tier] : null;
                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Score meter */}
                    {lead.reachabilityScore != null && (
                      <ScoreMeter score={lead.reachabilityScore} />
                    )}

                    {/* Business info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm truncate">{lead.businessName}</span>
                        {lead.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-600 truncate">{lead.niche}</span>
                        {lead.city && (
                          <span className="text-xs text-zinc-700 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{lead.city}{lead.state ? `, ${lead.state}` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tier badge */}
                    {tierCfg && (
                      <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 hidden sm:inline-flex", tierCfg.color)}>
                        {tierCfg.label}
                      </span>
                    )}

                    {/* Tech badges */}
                    <div className="hidden lg:flex items-center gap-1">
                      <TechBadge label="SSL" active={lead.hasSSL ?? false} />
                      <TechBadge label="Mobile" active={lead.isMobileOptimized ?? false} />
                      <TechBadge label="AI" active={lead.hasAI ?? false} />
                    </div>

                    {/* Contact icons */}
                    <div className="flex items-center gap-2 text-zinc-600">
                      {lead.website && <Globe className="w-3.5 h-3.5 hover:text-violet-400 cursor-pointer" onClick={() => window.open(lead.website!, "_blank")} />}
                      {lead.phone && <Phone className="w-3.5 h-3.5 hover:text-emerald-400 cursor-pointer" onClick={() => window.open(`tel:${lead.phone}`)} />}
                      {lead.email && <Mail className="w-3.5 h-3.5 hover:text-blue-400 cursor-pointer" onClick={() => window.open(`mailto:${lead.email}`)} />}
                    </div>

                    {/* Rating */}
                    {lead.googleRating && (
                      <div className="hidden md:flex items-center gap-1 text-xs text-zinc-600 flex-shrink-0">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span>{lead.googleRating}</span>
                        <span className="text-zinc-700">({lead.reviewCount})</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleStar(lead)}
                        className={cn("p-1.5 rounded-lg hover:bg-white/10 transition-colors", lead.isStarred ? "text-amber-400" : "text-zinc-600")}
                      >
                        <Star className={cn("w-3.5 h-3.5", lead.isStarred && "fill-amber-400")} />
                      </button>
                      <Link href={`/dashboard/leads/${lead.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-violet-400 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-center gap-2 p-4 border-t border-white/[0.06]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
