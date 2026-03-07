"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle2, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Immediate Aggressive Check for Recovery (handles fragments #type=recovery)
    const isRecovery =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery') ||
      window.location.hash.includes('access_token=');

    if (isRecovery) {
      console.log("Recovery flow detected on home page, hard redirecting...");
      const finalUrl = '/auth/reset-password' + window.location.search + window.location.hash;
      window.location.href = finalUrl;
      return;
    }

    // 2. Standard Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("PASSWORD_RECOVERY event in Home, redirecting with params...");
        const finalUrl = '/auth/reset-password' + window.location.search + window.location.hash;
        window.location.href = finalUrl;
      } else if (event === "SIGNED_IN") {
        // Only redirect to dashboard if not a recovery/callback flow
        const hasTokens = window.location.hash.includes('access_token=') || window.location.search.includes('type=recovery');
        if (!window.location.search.includes('code=') && !hasTokens) {
          router.push("/dashboard");
        }
      }
    });

    // 3. Initial check for existing session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !isRecovery && !window.location.search.includes('code=')) {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/10">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <Button asChild className="px-6">
              <Link href="/auth">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(0,0,0,0.03)_0%,transparent_100%)]" />
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/60"></span>
              </span>
              Now in Public Beta
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={cn("text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]", sansFont)}
            >
              Lead Forms, <br />
              <span className="text-muted-foreground italic">Done Right.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A premium, minimalist form builder built specifically to capture more leads.
              Ready to scale your next big idea from zero to one.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="h-14 px-8 rounded-full text-base group">
                <Link href="/auth">
                  Start Building
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-full text-base">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="container mx-auto px-6 mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-secondary/30 p-2 overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
              <div className="aspect-[16/9] rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground font-medium overflow-hidden">
                <div className="grid grid-cols-12 w-full h-full">
                  <div className="col-span-3 border-r border-border/30 bg-secondary/10 p-4 space-y-4">
                    <div className="h-4 w-2/3 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-full bg-secondary rounded-lg" />)}
                    </div>
                  </div>
                  <div className="col-span-9 p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-1/3 bg-muted rounded-full" />
                      <div className="h-10 w-10 bg-secondary rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-secondary/50 rounded-xl border border-border/20" />)}
                    </div>
                    <div className="h-48 bg-secondary/50 rounded-xl border border-border/20" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-sm text-muted-foreground">© 2026 Genesis Flow. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
