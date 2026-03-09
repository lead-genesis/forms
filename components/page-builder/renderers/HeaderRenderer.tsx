"use client";

import React from "react";
import { Menu } from "lucide-react";
import { BrandPage } from "@/app/actions/pages";

interface HeaderRendererProps {
    data: any;
    brand: any;
    brandPages?: BrandPage[];
}

export const HeaderRenderer = React.memo(({ data, brand, brandPages }: HeaderRendererProps) => {
    const navigation = data?.navigation || [];
    return (
        <header className="h-20 px-8 md:px-12 flex items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
                {brand?.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="h-8 w-auto" />
                ) : (
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white scale-90">
                        <span className="text-[14px] font-black">{brand?.name?.[0] || 'B'}</span>
                    </div>
                )}
                <span className="font-bold text-zinc-900 tracking-tight">{brand?.name || "Brand"}</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
                {navigation.length > 0 ? (
                    navigation.map((pageId: string) => {
                        const page = brandPages?.find(p => p.id === pageId);
                        return (
                            <span key={pageId} className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">
                                {page?.title || 'Link'}
                            </span>
                        );
                    })
                ) : (
                    <>
                        <span className="text-[13px] font-medium text-zinc-400">Home</span>
                        <span className="text-[13px] font-medium text-zinc-400">About</span>
                        <span className="text-[13px] font-medium text-zinc-400">Contact</span>
                    </>
                )}
            </nav>

            <div className="md:hidden">
                <Menu className="w-6 h-6 text-zinc-400" />
            </div>
        </header>
    );
});

HeaderRenderer.displayName = "HeaderRenderer";
