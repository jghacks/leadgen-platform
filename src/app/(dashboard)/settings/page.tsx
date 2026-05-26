"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { User, Key, Bell, Shield, CreditCard, Zap } from "lucide-react";

const SECTIONS = [
  {
    id: "profile",
    icon: User,
    title: "Profile",
    desc: "Name, email, and avatar",
    fields: [
      { label: "Full Name", type: "text", placeholder: "Alex Johnson" },
      { label: "Email", type: "email", placeholder: "alex@agency.com" },
      { label: "Agency Name", type: "text", placeholder: "YourAgency" },
    ],
  },
  {
    id: "api",
    icon: Key,
    title: "API Keys",
    desc: "Connect your AI and scraping services",
    fields: [
      { label: "Anthropic API Key", type: "password", placeholder: "sk-ant-..." },
      { label: "OpenAI API Key", type: "password", placeholder: "sk-proj-..." },
      { label: "Google Maps API Key", type: "password", placeholder: "AIza..." },
      { label: "SerpAPI Key", type: "password", placeholder: "your-key..." },
    ],
  },
  {
    id: "outreach",
    icon: Zap,
    title: "Outreach Defaults",
    desc: "Your name and agency for generated outreach",
    fields: [
      { label: "Your Name (for scripts)", type: "text", placeholder: "Alex" },
      { label: "Agency Name", type: "text", placeholder: "YourAgency" },
      { label: "Sender Email", type: "email", placeholder: "alex@youragency.com" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  <p className="text-xs text-zinc-600">{section.desc}</p>
                </div>
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-xs text-zinc-500">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                ))}

                <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
                  Save {section.title}
                </button>
              </div>
            </motion.div>
          ))}

          {/* Plan */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">Current Plan</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">Pro</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">5,000 leads/month · AI Website Generator · All features</p>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors">
              Manage Subscription
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
