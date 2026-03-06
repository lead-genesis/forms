"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, CheckCircle2, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/10">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Button asChild className="px-6">
              <Link href="/auth">Get Started</Link>
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
              The Foundation for <br />
              <span className="text-muted-foreground italic">Modern Web Apps.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A premium, minimalist template built with Next.js, Tailwind CSS, and Framer Motion.
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

        {/* Features Section */}
        <section id="features" className="py-24 bg-secondary/20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className={cn("text-3xl font-bold mb-4", sansFont)}>Everything you need.</h2>
              <p className="text-muted-foreground leading-relaxed">
                Built with performance and developer experience in mind.
                Stop worrying about boilerplate and start shipping features.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Speed", desc: "Optimized for sub-second loads and blazing fast interaction." },
                { icon: Shield, title: "Security", desc: "Best-in-class security patterns baked into every layer." },
                { icon: Globe, title: "Scale", desc: "Architected to handle everything from MVPs to millions of users." }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className={cn("text-xl font-bold mb-2", sansFont)}>{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-sm text-muted-foreground">© 2026 Genesis Forms. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
