"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useParams } from "next/navigation";
import { getBrandByDomain } from "@/app/actions/brands";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

interface BrandContextType {
    brand: any;
    isLoading: boolean;
    error: string | null;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const useBrand = () => {
    const context = useContext(BrandContext);
    if (context === undefined) {
        throw new Error("useBrand must be used within a BrandProvider");
    }
    return context;
};

export default function BrandRuntimeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const host = params.host as string;

    const [isLoading, setIsLoading] = useState(true);
    const [brand, setBrand] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!host) return;

        (async () => {
            try {
                setIsLoading(true);
                const { data: brandData, error: brandError } = await getBrandByDomain(host);

                if (brandError || !brandData) {
                    setError("Brand not found");
                    return;
                }

                setBrand(brandData);
            } catch (err) {
                console.error("Brand runtime error:", err);
                setError("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [host]);

    // Update document title
    useEffect(() => {
        if (brand?.name) {
            document.title = brand.name;
        }
    }, [brand]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !brand) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center space-y-3 max-w-sm px-6">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl mx-auto flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold">{error || "Brand Not Found"}</h1>
                    <p className="text-sm text-muted-foreground">We couldn't find the site you were looking for.</p>
                </div>
            </div>
        );
    }

    return (
        <BrandContext.Provider value={{ brand, isLoading, error }}>
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

                        <div className="flex items-center gap-4">
                            {/* Potential call to action or search */}
                        </div>
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
                            <p className="text-sm text-zinc-500 max-w-sm">
                                {brand.description}
                            </p>
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
                                <li><Link href="#" className="text-sm text-zinc-500 hover:text-black transition-colors italic opacity-50">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-sm text-zinc-500 hover:text-black transition-colors italic opacity-50">Terms of Service</Link></li>
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
        </BrandContext.Provider>
    );
}
