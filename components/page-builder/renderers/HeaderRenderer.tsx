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
    const logoToUse = data?.customLogoUrl || brand?.logo_url;
    const logoHeight = data?.logoHeight || 32;
    const navFontSize = data?.navFontSize || 13;

    return (
        <header className="h-20 px-8 md:px-12 flex items-center justify-between border-b border-zinc-100 bg-white">
            <div className="flex items-center gap-3">
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
                            {brand?.name?.[0] || 'B'}
                        </span>
                    </div>
                )}
            </div>

            <nav className="hidden md:flex items-center gap-8">
                {navigation.length > 0 ? (
                    navigation.map((pageId: string) => {
                        const page = brandPages?.find(p => p.id === pageId);
                        const href = page ? (page.is_index ? '/' : `/${page.slug}`) : '#';
                        return (
                            <a
                                key={pageId}
                                href={href}
                                className="font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                                style={{ fontSize: `${navFontSize}px` }}
                            >
                                {page?.title || 'Link'}
                            </a>
                        );
                    })
                ) : (
                    <>
                        <span className="font-medium text-zinc-400" style={{ fontSize: `${navFontSize}px` }}>Home</span>
                        <span className="font-medium text-zinc-400" style={{ fontSize: `${navFontSize}px` }}>About</span>
                        <span className="font-medium text-zinc-400" style={{ fontSize: `${navFontSize}px` }}>Contact</span>
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
