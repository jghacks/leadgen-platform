"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Plus, Megaphone, Users, Mail, Play, Pause, BarChart2, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type CampaignStatus = "ACTIVE" | "DRAFT" | "PAUSED" | "COMPLETED";

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ACTIVE:    { label: "Active",    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Play },
  DRAFT:     { label: "Draft",     color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",          icon: Clock },
  PAUSED:    { label: "Paused",    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",       icon: Pause },
  COMPLETED: { label: "Completed", color: "text-blue-400 bg-blue-500/10 border-blue-500/20",          icon: CheckCircle },
};

const SAMPLE_CAMPAIGNS = [
  { id: "1", name: "Dallas HVAC Blitz", type: "EMAIL_SEQUENCE", status: "ACTIVE" as CampaignStatus,    totalLeads: 47, sent: 38, opened: 21, replied: 4, converted: 1, niche: "HVAC", city: "Dallas, TX" },
  { id: "2", name: "Austin Law Firms",  type: "EMAIL_SEQUENCE", status: "ACTIVE" as CampaignStatus,    totalLeads: 23, sent: 15, opened: 9,  replied: 2, converted: 0, niche: "Lawyer", city: "Austin, TX" },
  { id: "3", name: "Miami Dentists Q2", type: "MULTI_CHANNEL",  status: "PAUSED" as CampaignStatus,    totalLeads: 31, sent: 31, opened: 18, replied: 5, converted: 2, niche: "Dentist", city: "Miami, FL" },
  { id: "4", name: "Phoenix Gym Outreach", type: "COLD_CALL",   status: "DRAFT" as CampaignStatus,     totalLeads: 18, sent: 0,  opened: 0,  replied: 0, converted: 0, niche: "Gym", city: "Phoenix, AZ" },
  { id: "5", name: "Nashville Restaurants",type: "EMAIL_SEQUENCE",status: "COMPLETED" as CampaignStatus, totalLeads: 55, sent: 55, opened: 34, replied: 9, converted: 3, niche: "Restaurant", city: "Nashville, TN" },
];

export default function CampaignsPage() {
  const [campaigns] = useState(SAMPLE_CAMPAIGNS);

  const totalLeads = campaigns.reduce((s, c) => s + c.totalLeads, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalReplies = campaigns.reduce((s, c) => s + c.replied, 0);
  const totalConverted = campaigns.reduce((s, c) => s + c.converted, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Campaigns" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Outreach Campaigns</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Manage multi-step email sequences and call campaigns</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Emails Sent", value: totalSent, icon: Mail, color: "text-violet-400", bg: "bg-violet-500/10" },
            { label: "Replies", value: totalReplies, icon: BarChart2, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Converted", value: totalConverted, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-xs text-zinc-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Campaign list */}
        <div className="space-y-3">
          {campaigns.map((campaign, i) => {
            const cfg = STATUS_CONFIG[campaign.status];
            const openRate = campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
            const replyRate = campaign.sent > 0 ? Math.round((campaign.replied / campaign.sent) * 100) : 0;

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-600">{campaign.niche} · {campaign.city}</span>
                        <span className="text-xs text-zinc-700 bg-white/5 px-1.5 py-0.5 rounded-full">
                          {campaign.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5", cfg.color)}>
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-violet-400 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{campaign.totalLeads}</div>
                    <div className="text-[10px] text-zinc-600 mb-1.5">Total Leads</div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <div className="h-1 bg-violet-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">{openRate}%</div>
                    <div className="text-[10px] text-zinc-600 mb-1.5">Open Rate</div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <div className="h-1 bg-blue-500 rounded-full" style={{ width: `${openRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-400">{replyRate}%</div>
                    <div className="text-[10px] text-zinc-600 mb-1.5">Reply Rate</div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${replyRate}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
