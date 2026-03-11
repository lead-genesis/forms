"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { HeaderRenderer } from "@/components/page-builder/renderers/HeaderRenderer";
import { BrandPage } from "@/app/actions/pages";

interface BrandRuntimeShellProps {
    brand: {
        name: string;
        description?: string;
        logo_url?: string;
        header_config?: {
            customLogoUrl?: string | null;
            logoHeight?: number;
            navigation?: string[];
            navFontSize?: number;
        } | null;
    };
    brandPages?: BrandPage[];
    children: React.ReactNode;
}

export function BrandRuntimeShell({ brand, brandPages, children }: BrandRuntimeShellProps) {
    const headerConfig = brand.header_config || {};
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        handleScroll(); // Initial check
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <div className={cn(
                "sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-200",
                isScrolled ? "border-b border-zinc-100 shadow-sm" : "border-b border-transparent"
            )}>
                <HeaderRenderer
                    data={headerConfig}
                    brand={brand}
                    brandPages={brandPages}
                />
            </div>

            <main>
                {children}
            </main>

            {/* Brand Footer */}
            <footer className="border-t border-zinc-100 bg-zinc-50 py-20 mt-20">
                <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
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
                            {brandPages && brandPages.length > 0 ? (
                                (headerConfig.navigation && headerConfig.navigation.length > 0
                                    ? headerConfig.navigation
                                    : brandPages.map(p => p.id)
                                ).map((pageId: string) => {
                                    const page = brandPages.find(p => p.id === pageId);
                                    if (!page || !page.is_published) return null;
                                    const href = page.is_index ? '/' : `/${page.slug}`;
                                    return (
                                        <li key={pageId}>
                                            <Link href={href} className="text-sm text-zinc-600 hover:text-black transition-colors">
                                                {page.title}
                                            </Link>
                                        </li>
                                    );
                                })
                            ) : (
                                <>
                                    <li><Link href="/" className="text-sm text-zinc-600 hover:text-black transition-colors">Home</Link></li>
                                    <li><Link href="/blogs" className="text-sm text-zinc-600 hover:text-black transition-colors">Blog</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-black transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-[1200px] mx-auto px-6 pt-12 mt-12 border-t border-zinc-200">
                    <p className="text-xs text-zinc-400 text-center">
                        © {new Date().getFullYear()} {brand?.name || "Brand Name"}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
