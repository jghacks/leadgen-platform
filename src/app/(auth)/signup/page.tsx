"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

const PERKS = [
  "50 free leads to start",
  "AI website generator included",
  "Cold email + call scripts",
  "No credit card required",
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      toast.success("Account created! Check your email to confirm.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Value prop */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">LeadForge<span className="text-violet-400">AI</span></span>
          </Link>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start closing deals<br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">with AI today</span>
          </h1>
          <p className="text-zinc-400 mb-8">Join 2,400+ agency owners who use LeadForge to find and close local business clients.</p>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                {perk}
              </li>
            ))}
          </ul>
          {/* Mini testimonial */}
          <div className="mt-10 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <p className="text-zinc-400 text-sm italic">"Closed $8,500 in my first week using the AI website previews. My prospects were blown away."</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">R</div>
              <span className="text-zinc-500 text-xs">Ryan M. · Web Design Agency, Phoenix AZ</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="md:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LeadForge<span className="text-violet-400">AI</span></span>
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-zinc-500 text-sm mb-6">Free for 14 days. No credit card needed.</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    placeholder="Alex Johnson"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    placeholder="you@agency.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Free Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-xs text-zinc-600 text-center">
                By signing up you agree to our{" "}
                <a href="#" className="text-zinc-500 underline">Terms</a> and{" "}
                <a href="#" className="text-zinc-500 underline">Privacy Policy</a>.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-zinc-600 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
