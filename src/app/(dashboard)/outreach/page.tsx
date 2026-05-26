"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Mail, Phone, MessageSquare, Copy, Check, RefreshCw, Loader2, ChevronDown, Zap, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Mode = "email" | "script" | "sms";

const SAMPLE_EMAIL = {
  subject: "Your HVAC site is missing out on a lot of local traffic",
  body: `Hi Mike,

I was looking up HVAC companies in Dallas earlier and noticed your site on Google.

Quick observation — it's not showing up for some of the keywords your competitors are ranking for, and the site doesn't seem to be converting mobile visitors (which is 70% of your traffic). I ran a quick check and found a few things I thought you'd want to know.

Would it make sense to jump on a 15-minute call this week? I can share the exact issues I found and show you what a fix would look like.

No pitch, just a quick look at what we found.`,
  followUp1: `Hey Mike, just wanted to bump this up in case it got buried.

Quick question — do you know what your current conversion rate is from website visitors to actual phone calls? Most HVAC sites we see are sitting around 1-2%. We typically get clients to 6-8%.

Worth a 15-minute look if you're curious.`,
  smsVariant: "Hey Mike, found some issues with your HVAC site that could be pulling in 3x more calls. Worth a quick 15-min chat? - Alex from LeadForge",
};

const SAMPLE_SCRIPT = {
  opener: `"Hey Mike! This is Alex — I was actually looking at your HVAC site in Dallas earlier today and noticed a couple things I thought you'd want to know about. Got 60 seconds?"`,
  pitch: `"So I specialize in helping HVAC companies in Dallas get more inbound calls from their website. When I pulled up your site, I noticed you're not showing up for some of the searches your competitors are ranking for — plus the site isn't optimized for mobile, which is how most people search for HVAC services. That's typically leaving $3,000-$5,000 a month on the table. We've helped similar HVAC companies in your area add 20-30% more calls within 60 days. Want me to show you exactly what we'd do?"`,
  objectionHandling: {
    "not interested": `"Totally get it — the last thing you need is another call. I'm not trying to sell you anything today. Can I just share what I found in 30 seconds? If it's not useful, hang up."`,
    "we already have someone": `"Great — who handles it? Do you know what your current conversion rate is from website visitors to calls? Most HVAC sites we see are at 1-2%. We get our clients to 6-8%. Worth knowing if your current person is tracking that."`,
    "send me something": `"Absolutely — what's the best email? And while I've got you — would 15 minutes this week make sense so I can actually walk you through what I found? Tuesday or Thursday morning work?"`,
  },
  voicemailScript: `"Hey Mike, this is Alex — I was looking at your HVAC website in Dallas today and found something I think you'd want to know about — it's costing you leads every week. Give me a call back at [number] or check your email. I'll send over what I found. Talk soon."`,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Copied!"); }}
      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-zinc-400 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function EmailBlock({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
        <span className="text-sm font-medium text-white">{label}</span>
        <div className="flex items-center gap-2">
          <CopyButton text={content} />
          <ChevronDown className={cn("w-4 h-4 text-zinc-600 transition-transform", open && "rotate-180")} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-white/[0.06]">
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap mt-3">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OutreachPage() {
  const [mode, setMode] = useState<Mode>("email");
  const [businessName, setBusinessName] = useState("Mike's HVAC Services");
  const [ownerName, setOwnerName] = useState("Mike");
  const [niche, setNiche] = useState("HVAC");
  const [city, setCity] = useState("Dallas, TX");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(true); // show sample on load

  const handleGenerate = async () => {
    if (!businessName || !niche) { toast.error("Enter business name and niche"); return; }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800)); // simulate AI generation
    setGenerated(true);
    setGenerating(false);
    toast.success("Outreach generated!");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Outreach Generator" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs mb-3">
              <Zap className="w-3.5 h-3.5" /> AI-Powered Outreach
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Generate outreach in seconds</h2>
            <p className="text-zinc-500 text-sm">Cold emails, call scripts, and SMS — all personalized to the business.</p>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl w-fit">
            {([
              { id: "email", icon: Mail, label: "Cold Email" },
              { id: "script", icon: Phone, label: "Call Script" },
              { id: "sms", icon: MessageSquare, label: "SMS" },
            ] as { id: Mode; icon: React.ComponentType<{ className?: string }>; label: string }[]).map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all", mode === m.id ? "bg-violet-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-400")}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Input form */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Business Name</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                  placeholder="Mike's HVAC Services" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Owner Name</label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                  placeholder="Mike" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">Business Niche</label>
                <input value={niche} onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                  placeholder="HVAC, Dentist, Lawyer..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                  placeholder="Dallas, TX" />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Send className="w-4 h-4" /> Generate {mode === "email" ? "Email Sequence" : mode === "script" ? "Call Script" : "SMS"}</>}
            </button>
          </div>

          {/* Output */}
          <AnimatePresence>
            {generated && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {mode === "email" && (
                  <>
                    <EmailBlock label="📌 Subject Line" content={SAMPLE_EMAIL.subject} />
                    <EmailBlock label="✉️ Initial Cold Email" content={SAMPLE_EMAIL.body} />
                    <EmailBlock label="📩 Follow-up #1 (Day 3)" content={SAMPLE_EMAIL.followUp1} />
                    <EmailBlock label="💬 SMS Version" content={SAMPLE_EMAIL.smsVariant} />
                  </>
                )}

                {mode === "script" && (
                  <>
                    <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-violet-400">🎯 Opener (First 15 seconds)</span>
                        <CopyButton text={SAMPLE_SCRIPT.opener} />
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{SAMPLE_SCRIPT.opener}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-400">💬 Core 60-Second Pitch</span>
                        <CopyButton text={SAMPLE_SCRIPT.pitch} />
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{SAMPLE_SCRIPT.pitch}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-cyan-400">📱 Voicemail Script</span>
                        <CopyButton text={SAMPLE_SCRIPT.voicemailScript} />
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{SAMPLE_SCRIPT.voicemailScript}</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                      <h4 className="text-sm font-semibold text-white mb-3">⚔️ Objection Handling</h4>
                      <div className="space-y-3">
                        {Object.entries(SAMPLE_SCRIPT.objectionHandling).map(([obj, resp]) => (
                          <div key={obj} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                            <div className="text-xs font-semibold text-red-400 mb-1">"{obj}"</div>
                            <p className="text-xs text-zinc-400 leading-relaxed">{resp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {mode === "sms" && (
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-400">💬 SMS (160 chars)</span>
                      <CopyButton text={SAMPLE_EMAIL.smsVariant} />
                    </div>
                    <p className="text-sm text-zinc-300">{SAMPLE_EMAIL.smsVariant}</p>
                    <div className="mt-2 text-xs text-zinc-700">{SAMPLE_EMAIL.smsVariant.length}/160 characters</div>
                  </div>
                )}

                <button onClick={() => { setGenerated(false); handleGenerate(); }}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate with different angle
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
