"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import {
  TrendingUp, Users, Globe, Mail, Zap, ArrowRight,
  Star, Clock, DollarSign, Target, BarChart2, Activity
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const METRICS = [
  { label: "Total Leads", value: "247", change: "+34 this week", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/10" },
  { label: "Hot Leads", value: "47", change: "+12 new", icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/10" },
  { label: "Emails Sent", value: "128", change: "43% open rate", icon: Mail, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "shadow-violet-500/10" },
  { label: "Sites Generated", value: "23", change: "8 exported", icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/10" },
  { label: "Pipeline Value", value: "$84,500", change: "3 deals closing", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
  { label: "Avg. Score", value: "71", change: "+5 pts this week", icon: Zap, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "shadow-pink-500/10" },
];

const LEAD_TREND = [
  { day: "Mon", leads: 12, emails: 8, sites: 2 },
  { day: "Tue", leads: 19, emails: 14, sites: 3 },
  { day: "Wed", leads: 8, emails: 5, sites: 1 },
  { day: "Thu", leads: 31, emails: 22, sites: 5 },
  { day: "Fri", leads: 24, emails: 18, sites: 4 },
  { day: "Sat", leads: 7, emails: 4, sites: 1 },
  { day: "Sun", leads: 15, emails: 11, sites: 3 },
];

const TIER_DATA = [
  { name: "Hot Lead", value: 47, color: "#10b981" },
  { name: "Very Likely", value: 89, color: "#f59e0b" },
  { name: "Medium", value: 73, color: "#f97316" },
  { name: "Low Priority", value: 38, color: "#ef4444" },
];

const RECENT_LEADS = [
  { name: "Mike's HVAC Services", niche: "HVAC", city: "Dallas, TX", score: 91, tier: "HOT_LEAD", time: "2m ago" },
  { name: "Smith & Associates Law", niche: "Lawyer", city: "Austin, TX", score: 84, tier: "HOT_LEAD", time: "8m ago" },
  { name: "Peak Performance Gym", niche: "Gym", city: "Phoenix, AZ", score: 73, tier: "VERY_LIKELY", time: "15m ago" },
  { name: "Bella Cucina Restaurant", niche: "Restaurant", city: "Nashville, TN", score: 62, tier: "MEDIUM", time: "1h ago" },
  { name: "Sunrise Dental Care", niche: "Dentist", city: "Miami, FL", score: 88, tier: "HOT_LEAD", time: "2h ago" },
];

const ACTIVITY = [
  { icon: "🔥", text: "New HOT LEAD: Mike's HVAC Services (Score: 91)", time: "2m ago" },
  { icon: "✉️", text: "Email sequence generated for Smith & Associates Law", time: "8m ago" },
  { icon: "🌐", text: "Website preview generated for Peak Performance Gym", time: "15m ago" },
  { icon: "📊", text: "Scrape job completed: 34 HVAC leads in Dallas TX", time: "1h ago" },
  { icon: "📞", text: "Call script created for Bella Cucina Restaurant", time: "2h ago" },
  { icon: "⭐", text: "Sunrise Dental Care starred and moved to pipeline", time: "3h ago" },
];

const TIER_COLORS = {
  HOT_LEAD: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  VERY_LIKELY: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  MEDIUM: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  LOW_PRIORITY: "text-red-400 bg-red-500/10 border-red-500/30",
};

const TIER_LABELS = {
  HOT_LEAD: "🔥 HOT",
  VERY_LIKELY: "⭐ LIKELY",
  MEDIUM: "📊 MEDIUM",
  LOW_PRIORITY: "🔵 LOW",
};

const stagger = { show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Dashboard" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Good morning 👋</h2>
            <p className="text-zinc-500 text-sm mt-0.5">You have 12 hot leads waiting for outreach.</p>
          </div>
          <Link
            href="/dashboard/scraper"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            New Scrape Job
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Metrics grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {METRICS.map((m) => (
            <motion.div
              key={m.label}
              variants={fadeUp}
              className={`p-4 rounded-xl bg-white/[0.03] border ${m.border} hover:shadow-lg ${m.glow} transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{m.label}</div>
              <div className="text-[10px] text-zinc-700 mt-1">{m.change}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-white">Activity This Week</h3>
                <p className="text-zinc-600 text-xs mt-0.5">Leads · Emails · Sites</p>
              </div>
              <BarChart2 className="w-4 h-4 text-zinc-600" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={LEAD_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="emailGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc", fontSize: 12 }}
                  cursor={{ stroke: "rgba(255,255,255,0.05)" }}
                />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} fill="url(#leadGrad)" name="Leads" />
                <Area type="monotone" dataKey="emails" stroke="#06b6d4" strokeWidth={2} fill="url(#emailGrad)" name="Emails" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tier breakdown pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
          >
            <h3 className="font-semibold text-white mb-1">Lead Tiers</h3>
            <p className="text-zinc-600 text-xs mb-4">Reachability distribution</p>
            <div className="flex justify-center">
              <PieChart width={140} height={140}>
                <Pie data={TIER_DATA} cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {TIER_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc", fontSize: 11 }}
                />
              </PieChart>
            </div>
            <div className="space-y-2 mt-3">
              {TIER_DATA.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                    <span className="text-zinc-500">{t.name}</span>
                  </div>
                  <span className="text-zinc-400 font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent leads + Activity */}
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Recent leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent Leads</h3>
              <Link href="/dashboard/leads" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {RECENT_LEADS.map((lead, i) => (
                <motion.div
                  key={lead.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-sm">
                      {lead.niche === "HVAC" ? "❄️" : lead.niche === "Lawyer" ? "⚖️" : lead.niche === "Gym" ? "💪" : lead.niche === "Restaurant" ? "🍽️" : "🦷"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{lead.name}</div>
                      <div className="text-xs text-zinc-600">{lead.city}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${TIER_COLORS[lead.tier as keyof typeof TIER_COLORS]}`}>
                      {TIER_LABELS[lead.tier as keyof typeof TIER_LABELS]}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{lead.score}</div>
                      <div className="text-[10px] text-zinc-700">{lead.time}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-500" />
              <h3 className="font-semibold text-white">Activity Feed</h3>
            </div>
            <div className="p-4 space-y-4">
              {ACTIVITY.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.text}</p>
                    <p className="text-[10px] text-zinc-700 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: "Scrape New Leads", desc: "Find businesses in any city", href: "/dashboard/scraper", icon: "🔍", color: "from-violet-500/10 to-blue-500/10 border-violet-500/20" },
            { label: "Generate Email", desc: "AI cold email in 30 seconds", href: "/dashboard/outreach", icon: "✉️", color: "from-cyan-500/10 to-teal-500/10 border-cyan-500/20" },
            { label: "Build Website", desc: "Preview for any lead", href: "/dashboard/websites", icon: "🌐", color: "from-emerald-500/10 to-green-500/10 border-emerald-500/20" },
            { label: "Open Pipeline", desc: "Manage your deals", href: "/dashboard/crm", icon: "📊", color: "from-amber-500/10 to-orange-500/10 border-amber-500/20" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`p-4 rounded-xl bg-gradient-to-br ${action.color} border hover:opacity-80 transition-all hover:-translate-y-0.5 group`}
            >
              <span className="text-2xl mb-3 block">{action.icon}</span>
              <div className="font-medium text-white text-sm">{action.label}</div>
              <div className="text-zinc-600 text-xs mt-0.5">{action.desc}</div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
