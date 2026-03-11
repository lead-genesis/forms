"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BrandPage } from "@/app/actions/pages";
import { cn } from "@/lib/utils";

interface NavLink {
    id: string;
    label: string;
    href: string;
}

interface HeaderRendererProps {
    data: any;
    brand: any;
    brandPages?: BrandPage[];
    /** Force the mobile (hamburger) layout regardless of screen width */
    forceMobile?: boolean;
    /**
     * Contained mode: the slide-out overlay is scoped to the nearest
     * `relative` ancestor instead of covering the full viewport.
     * Use this when rendering inside a preview box.
     */
    contained?: boolean;
}

export const HeaderRenderer = React.memo(({ data, brand, brandPages, forceMobile, contained }: HeaderRendererProps) => {
    const navigation = data?.navigation || [];
    const logoToUse = data?.customLogoUrl || brand?.logo_url;
    const logoHeight = data?.logoHeight || 32;
    const navFontSize = data?.navFontSize || 13;
    const [mobileOpen, setMobileOpen] = useState(false);

    // Lock body scroll on the live site, but not inside preview containers
    useEffect(() => {
        if (contained) return;
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = ""; };
        }
    }, [mobileOpen, contained]);

    // Close menu when switching out of mobile/tablet view in the preview
    useEffect(() => {
        if (!forceMobile) setMobileOpen(false);
    }, [forceMobile]);

    const closeMobile = useCallback(() => setMobileOpen(false), []);

    const resolvedLinks = navigation.length > 0
        ? navigation.map((pageId: string) => {
            const page = brandPages?.find(p => p.id === pageId);
            return { id: pageId, label: page?.title || "Link", href: page ? (page.is_index ? "/" : `/${page.slug}`) : "#" };
        })
        : null;

    const placeholderLinks = [
        { id: "ph-home", label: "Home", href: "#" },
        { id: "ph-about", label: "About", href: "#" },
        { id: "ph-contact", label: "Contact", href: "#" },
    ];

    const links = resolvedLinks || placeholderLinks;
    const isPlaceholder = !resolvedLinks;

    // When contained: use `absolute` positioning so the overlay is clipped to
    // the nearest `relative` ancestor (the preview box, NOT this component's
    // own wrapper). When not contained (live site): use `fixed` to cover the
    // full viewport.
    //
    // IMPORTANT: when `contained`, do NOT add `relative` to this component's
    // own wrapper — that would scope the `absolute inset-0` overlay to the
    // header's ~80px height instead of the full preview box.
    const overlayPositioning = contained ? "absolute" : "fixed";

    return (
        <div>
            <header className="h-14 sm:h-16 lg:h-20 border-b border-zinc-100 bg-white relative z-10 w-full">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between h-full">
                    <a href="/" className="flex items-center gap-3 shrink-0" onClick={(e) => e.preventDefault()}>
                        {logoToUse ? (
                            <img
                                src={logoToUse}
                                alt={brand?.name}
                                className="w-auto object-contain"
                                style={{ height: `${logoHeight}px` }}
                            />
                        ) : (
                            <div
                                className="bg-zinc-900 rounded-xl flex items-center justify-center text-white"
                                style={{ width: `${logoHeight * 1.25}px`, height: `${logoHeight * 1.25}px` }}
                            >
                                <span style={{ fontSize: `${logoHeight * 0.45}px` }} className="font-black">
                                    {brand?.name?.[0] || "B"}
                                </span>
                            </div>
                        )}
                    </a>

                    <nav className={cn("items-center gap-8", forceMobile ? "hidden" : "hidden md:flex")}>
                        {links.map((link: NavLink) => (
                            <a
                                key={link.id}
                                href={link.href}
                                className={cn(
                                    "font-medium transition-colors",
                                    isPlaceholder ? "text-zinc-400" : "text-zinc-500 hover:text-zinc-900"
                                )}
                                style={{ fontSize: `${navFontSize}px` }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <button
                        onClick={() => setMobileOpen(true)}
                        className={cn(
                            "p-2 -mr-2 rounded-lg hover:bg-zinc-50 transition-colors",
                            forceMobile ? "flex" : "flex md:hidden"
                        )}
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6 text-zinc-500" />
                    </button>
                </div>
            </header>

            {/* Mobile slide-out overlay — absolute when contained, fixed on live site */}
            <div
                className={cn(
                    overlayPositioning,
                    "inset-0 z-[200] transition-opacity duration-300",
                    mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobile} />

                <div
                    className={cn(
                        "absolute top-0 right-0 h-full w-[240px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
                        mobileOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-100 shrink-0">
                        <span className="text-sm font-bold text-zinc-900 tracking-tight">Menu</span>
                        <button
                            onClick={closeMobile}
                            className="p-1.5 -mr-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-3 px-3">
                        {links.map((link: NavLink) => (
                            <a
                                key={link.id}
                                href={link.href}
                                onClick={closeMobile}
                                className={cn(
                                    "flex items-center px-3 py-3 rounded-xl font-medium transition-colors",
                                    isPlaceholder
                                        ? "text-zinc-400"
                                        : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50"
                                )}
                                style={{ fontSize: `${Math.max(navFontSize, 14)}px` }}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="px-5 py-4 border-t border-zinc-100 shrink-0">
                        {logoToUse ? (
                            <img src={logoToUse} alt={brand?.name} className="h-5 w-auto object-contain opacity-40" />
                        ) : (
                            <span className="text-xs font-bold text-zinc-300 tracking-tight">{brand?.name}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

HeaderRenderer.displayName = "HeaderRenderer";
