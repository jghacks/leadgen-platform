"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { DollarSign, Plus, Star, Phone, Mail, Globe, MoreHorizontal, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Stage = { id: string; name: string; color: string; emoji: string };
type Deal = { id: string; business: string; niche: string; city: string; value: number; score: number; tier: string; phone?: string; stageId: string; daysInStage: number };

const STAGES: Stage[] = [
  { id: "new",        name: "New Leads",       color: "border-zinc-500/30 bg-zinc-500/5",    emoji: "🆕" },
  { id: "contacted",  name: "Contacted",        color: "border-blue-500/30 bg-blue-500/5",    emoji: "📞" },
  { id: "interested", name: "Interested",       color: "border-violet-500/30 bg-violet-500/5", emoji: "🤩" },
  { id: "proposal",   name: "Proposal Sent",    color: "border-amber-500/30 bg-amber-500/5",  emoji: "📄" },
  { id: "closed",     name: "Closed Won",       color: "border-emerald-500/30 bg-emerald-500/5", emoji: "🏆" },
];

const INITIAL_DEALS: Deal[] = [
  { id: "1", business: "Mike's HVAC Services",   niche: "HVAC",       city: "Dallas, TX",    value: 4500, score: 91, tier: "HOT_LEAD",    phone: "+1 (214) 555-0192", stageId: "new",        daysInStage: 1 },
  { id: "2", business: "Smith & Associates Law", niche: "Lawyer",     city: "Austin, TX",    value: 6500, score: 84, tier: "HOT_LEAD",    phone: "+1 (512) 555-0147", stageId: "new",        daysInStage: 0 },
  { id: "3", business: "Peak Performance Gym",   niche: "Gym",        city: "Phoenix, AZ",   value: 3200, score: 73, tier: "VERY_LIKELY", stageId: "contacted",  daysInStage: 2 },
  { id: "4", business: "Bella Cucina",           niche: "Restaurant", city: "Nashville, TN", value: 2800, score: 62, tier: "MEDIUM",      stageId: "interested", daysInStage: 5 },
  { id: "5", business: "Sunrise Dental Care",    niche: "Dentist",    city: "Miami, FL",     value: 5200, score: 88, tier: "HOT_LEAD",    stageId: "interested", daysInStage: 3 },
  { id: "6", business: "Johnson Plumbing Co",    niche: "Plumber",    city: "Houston, TX",   value: 3800, score: 77, tier: "VERY_LIKELY", stageId: "proposal",   daysInStage: 1 },
  { id: "7", business: "Green Valley Realty",    niche: "Realtor",    city: "Denver, CO",    value: 4200, score: 69, tier: "VERY_LIKELY", stageId: "proposal",   daysInStage: 4 },
  { id: "8", business: "CrossFit Eastside",      niche: "Gym",        city: "Seattle, WA",   value: 3500, score: 82, tier: "HOT_LEAD",    stageId: "closed",     daysInStage: 0 },
];

const TIER_COLORS: Record<string, string> = {
  HOT_LEAD:     "text-emerald-400",
  VERY_LIKELY:  "text-amber-400",
  MEDIUM:       "text-orange-400",
  LOW_PRIORITY: "text-red-400",
};

const NICHE_EMOJI: Record<string, string> = {
  HVAC: "❄️", Lawyer: "⚖️", Gym: "💪", Restaurant: "🍽️", Dentist: "🦷", Plumber: "🔧", Realtor: "🏡",
};

function DealCard({ deal, onMove }: { deal: Deal; onMove: (id: string, dir: "left" | "right") => void }) {
  const stageIdx = STAGES.findIndex((s) => s.id === deal.stageId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-white/10 transition-all cursor-grab group space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{NICHE_EMOJI[deal.niche] ?? "🏢"}</span>
          <div className="min-w-0">
            <Link href={`/dashboard/leads/${deal.id}`} className="text-sm font-medium text-white hover:text-violet-400 truncate block transition-colors">
              {deal.business}
            </Link>
            <div className="text-[10px] text-zinc-600 mt-0.5">{deal.city}</div>
          </div>
        </div>
        <button className="p-1 rounded-lg hover:bg-white/10 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-emerald-400 font-semibold text-sm">
          <DollarSign className="w-3.5 h-3.5" />
          {deal.value.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border-2 border-white/10 flex items-center justify-center" style={{ background: `conic-gradient(#6366f1 ${deal.score * 3.6}deg, rgba(255,255,255,0.05) 0)` }}>
            <div className="w-3 h-3 rounded-full bg-[#0a0a12] flex items-center justify-center">
              <span className="text-[6px] font-bold text-white">{deal.score}</span>
            </div>
          </div>
          <span className={cn("text-[10px] font-semibold", TIER_COLORS[deal.tier])}>
            {deal.tier === "HOT_LEAD" ? "🔥" : deal.tier === "VERY_LIKELY" ? "⭐" : "📊"}
          </span>
        </div>
      </div>

      {deal.phone && (
        <div className="text-[10px] text-zinc-700 flex items-center gap-1">
          <Phone className="w-2.5 h-2.5" /> {deal.phone}
        </div>
      )}

      {deal.daysInStage > 0 && (
        <div className="text-[10px] text-zinc-700">{deal.daysInStage}d in stage</div>
      )}

      {/* Move buttons */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          disabled={stageIdx === 0}
          onClick={() => onMove(deal.id, "left")}
          className="flex-1 py-1 rounded-lg text-[10px] text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-center"
        >
          ← Back
        </button>
        <button
          disabled={stageIdx === STAGES.length - 1}
          onClick={() => onMove(deal.id, "right")}
          className="flex-1 py-1 rounded-lg text-[10px] text-violet-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-center"
        >
          Advance →
        </button>
      </div>
    </motion.div>
  );
}

export default function CRMPage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);

  const moveCard = (id: string, dir: "left" | "right") => {
    setDeals((prev) => prev.map((d) => {
      if (d.id !== id) return d;
      const idx = STAGES.findIndex((s) => s.id === d.stageId);
      const newIdx = dir === "right" ? Math.min(idx + 1, STAGES.length - 1) : Math.max(idx - 1, 0);
      return { ...d, stageId: STAGES[newIdx].id, daysInStage: 0 };
    }));
  };

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const closedValue = deals.filter((d) => d.stageId === "closed").reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="CRM Pipeline" />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Stats bar */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-white/[0.06] flex items-center gap-6 overflow-x-auto">
          {[
            { label: "Total Pipeline", value: `$${totalValue.toLocaleString()}`, color: "text-white" },
            { label: "Closed Won", value: `$${closedValue.toLocaleString()}`, color: "text-emerald-400" },
            { label: "Active Deals", value: deals.filter((d) => d.stageId !== "closed").length, color: "text-violet-400" },
            { label: "Hot Leads", value: deals.filter((d) => d.tier === "HOT_LEAD").length, color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="flex-shrink-0">
              <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-zinc-600">{s.label}</div>
            </div>
          ))}
          <div className="ml-auto flex-shrink-0">
            <Link href="/dashboard/scraper" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Leads
            </Link>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stageId === stage.id);
              const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

              return (
                <div key={stage.id} className="w-64 flex-shrink-0 flex flex-col">
                  {/* Stage header */}
                  <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl border mb-3", stage.color)}>
                    <div className="flex items-center gap-2">
                      <span>{stage.emoji}</span>
                      <span className="text-sm font-semibold text-white">{stage.name}</span>
                      <span className="text-xs text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                    </div>
                    {stageValue > 0 && (
                      <div className="text-xs text-zinc-500 font-medium">${stageValue.toLocaleString()}</div>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onMove={moveCard} />
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-white/[0.06] text-zinc-700">
                        <span className="text-2xl mb-1">+</span>
                        <span className="text-xs">No deals here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
