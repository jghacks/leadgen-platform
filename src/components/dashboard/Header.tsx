"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Bell, Command, Plus, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  { label: "New Scrape Job", href: "/dashboard/scraper", icon: "🔍" },
  { label: "View All Leads", href: "/dashboard/leads", icon: "👥" },
  { label: "Open CRM Pipeline", href: "/dashboard/crm", icon: "📊" },
  { label: "Generate Email", href: "/dashboard/outreach", icon: "✉️" },
];

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = QUICK_ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleAction = useCallback((href: string) => {
    setCmdOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#09090b]/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          {title && <h1 className="font-semibold text-white text-lg">{title}</h1>}
        </div>

        <div className="flex items-center gap-2">
          {/* Cmd+K trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Quick search</span>
            <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-600">⌘K</kbd>
          </button>

          {/* Quick add */}
          <button
            onClick={() => router.push("/dashboard/scraper")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Scrape</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-400 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
          </button>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg mx-4 rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <Command className="w-4 h-4 text-zinc-500" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads, actions, pages..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-600"
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-600">ESC</kbd>
              </div>

              <div className="p-2">
                <p className="text-[11px] font-medium text-zinc-600 px-2 py-1.5">Quick Actions</p>
                {filtered.map((action) => (
                  <button
                    key={action.href}
                    onClick={() => handleAction(action.href)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    <span className="text-base">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
