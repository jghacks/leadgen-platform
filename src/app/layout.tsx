import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "LeadForge AI — AI-Powered Lead Generation Platform", template: "%s | LeadForge AI" },
  description: "Scrape local businesses, score leads with AI, generate personalized websites and outreach in seconds. The ultimate tool for web design agencies.",
  keywords: ["lead generation", "AI", "web design agency", "cold outreach", "business scraper", "CRM"],
  openGraph: {
    title: "LeadForge AI — AI-Powered Lead Generation Platform",
    description: "Find hot leads, audit their websites, and close deals with AI-generated outreach.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(15, 15, 25, 0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f8fafc",
                backdropFilter: "blur(20px)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
