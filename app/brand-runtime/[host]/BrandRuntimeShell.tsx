"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

interface BrandRuntimeShellProps {
    brand: {
        name: string;
        description?: string;
        logo_url?: string;
    };
    children: React.ReactNode;
}

export function BrandRuntimeShell({ brand, children }: BrandRuntimeShellProps) {
    return (
        <div className="min-h-screen bg-white">
            {/* Brand Header */}
            <header className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="h-10 w-auto object-contain" />
                        ) : (
                            <span className={cn("text-xl font-bold tracking-tight", sansFont)}>{brand.name}</span>
                        )}
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">Home</Link>
                        <Link href="/blogs" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">Blog</Link>
                    </nav>

                    <div className="flex items-center gap-4" />
                </div>
            </header>

            <main>
                {children}
            </main>

            {/* Brand Footer */}
            <footer className="border-t border-zinc-100 bg-zinc-50 py-20 mt-20">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            {brand.logo_url ? (
                                <img src={brand.logo_url} alt={brand.name} className="h-8 w-auto object-contain opacity-70" />
                            ) : (
                                <span className={cn("text-lg font-bold tracking-tight text-zinc-400", sansFont)}>{brand.name}</span>
                            )}
                        </Link>
                        {brand.description && (
                            <p className="text-sm text-zinc-500 max-w-sm">{brand.description}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Navigation</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-sm text-zinc-600 hover:text-black transition-colors">Home</Link></li>
                            <li><Link href="/blogs" className="text-sm text-zinc-600 hover:text-black transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-black transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-6 pt-12 mt-12 border-t border-zinc-200">
                    <p className="text-xs text-zinc-400 text-center">
                        © {new Date().getFullYear()} {brand.name}. Powered by Genesis Flow.
                    </p>
                </div>
            </footer>
        </div>
    );
}
