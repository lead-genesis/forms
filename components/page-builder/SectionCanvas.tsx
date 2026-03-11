"use client";

import React, { useMemo } from "react";
import { BrandPage, BrandSection } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import { ViewportMode } from "@/components/builder/ViewportToggle";

// Modular Renderers
import { HeroRenderer } from "./renderers/HeroRenderer";
import { HeaderRenderer } from "./renderers/HeaderRenderer";
import { FeaturesRenderer } from "./renderers/FeaturesRenderer";
import { TextRenderer } from "./renderers/TextRenderer";
import { FormEmbedRenderer } from "./renderers/FormEmbedRenderer";
import { BlogContentRenderer } from "./renderers/BlogContentRenderer";
import { BlogListRenderer } from "./renderers/BlogListRenderer";

interface SectionCanvasProps {
    sections: BrandSection[];
    currentSectionId: string | null;
    onSectionSelect?: (id: string) => void;
    brand: any;
    brandPages?: BrandPage[];
    brandForms?: any[];
    backgroundColor?: string;
    viewport: ViewportMode;
    isPreview?: boolean;
    blogs?: any[];
    blog?: any;
}

export const SectionCanvas = React.memo(({ sections, currentSectionId, onSectionSelect, brand, brandPages, brandForms, backgroundColor, viewport, isPreview, blogs, blog }: SectionCanvasProps) => {
    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const filteredSections = useMemo(() => sections.filter(s => s.type !== 'header'), [sections]);

    return (
        <div className={cn(
            "bg-white flex flex-col transition-all duration-700 ease-in-out origin-top min-w-0 overflow-x-hidden",
            !isPreview && "shadow-2xl shadow-black/5",
            viewport === "desktop" ? cn("w-full min-h-[120vh]", !isPreview && "max-w-5xl rounded-[32px]") :
                viewport === "tablet" ? "w-[768px] max-w-[100vw] rounded-[36px] min-h-[1024px]" :
                    "w-[375px] max-w-[100vw] rounded-[40px] min-h-[667px] scale-[0.85] md:scale-100"
        )} style={{ backgroundColor: backgroundColor || '#ffffff' }}>
            {/* Browser/Phone Header */}
            {!isPreview && (
                <div className="h-12 sm:h-14 border-b border-zinc-50 flex items-center px-4 sm:px-6 shrink-0 bg-white/50 backdrop-blur-sm">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                    </div>
                    <div className="mx-auto bg-zinc-100/80 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-zinc-300/50" />
                        <span className="text-[10px] font-medium text-zinc-400 tabular-nums lowercase tracking-tight">
                            {brand?.name?.toLowerCase().replace(/\s/g, '') || "brand"}.com
                        </span>
                    </div>
                </div>
            )}

            {/* Brand Header Preview */}
            <HeaderRenderer
                data={brand?.header_config || {}}
                brand={brand}
                brandPages={brandPages}
                forceMobile={!isPreview && (viewport === "mobile" || viewport === "tablet")}
                contained={!isPreview}
            />

            {/* Sections Area */}
            <div className="flex-1 flex flex-col">
                {filteredSections.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-20 text-center space-y-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-zinc-500 font-semibold">Empty Page</h3>
                            <p className="text-zinc-400 text-[13px]">Add sections from the bottom menu to start building.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredSections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => !isPreview && onSectionSelect?.(section.id)}
                                className={cn(
                                    "relative transition-all duration-300",
                                    !isPreview && "cursor-pointer group",
                                    !isPreview && (currentSectionId === section.id ? "z-[60]" : "hover:bg-zinc-50/50")
                                )}
                                style={{ backgroundColor: section.data?.backgroundColor }}
                            >
                                <SectionRenderer section={section} brand={brand} brandPages={brandPages} brandForms={brandForms} isPreview={isPreview} blogs={blogs} blog={blog} viewport={viewport} />

                                {currentSectionId === section.id && (
                                    <>
                                        {/* Selection Border Overlay */}
                                        <div className="absolute inset-0 border-[3px] border-zinc-900 z-[40] pointer-events-none" />
                                        <div className="absolute top-4 right-4 flex items-center gap-2 z-[50]">
                                            <div className="bg-zinc-900 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-xl">
                                                {section.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Hover Indicator */}
                                {!isPreview && (
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-zinc-100/50 transition-colors pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Site Footer Placeholder */}
            <div className="p-6 sm:p-8 lg:p-12 border-t border-zinc-50 bg-zinc-50/30 font-sans">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">B</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                        © {currentYear} {brand?.name || "Brand Name"}. Built with Genesis Flow.
                    </p>
                </div>
            </div>
        </div>
    );
});

SectionCanvas.displayName = "SectionCanvas";

function SectionRenderer({ section, brand, brandPages, brandForms, isPreview, blogs, blog, viewport }: { section: BrandSection; brand: any; brandPages?: BrandPage[]; brandForms?: any[]; isPreview?: boolean; blogs?: any[]; blog?: any; viewport?: ViewportMode }) {
    const { data, type } = section;

    switch (type) {
        case 'hero':
            return <HeroRenderer data={data} fontColor={data?.fontColor || '#18181b'} imageUrl={data?.imageUrl} isPreview={isPreview} brandPages={brandPages} brandForms={brandForms} viewport={viewport} />;
        case 'header':
            return <HeaderRenderer data={data} brand={brand} brandPages={brandPages} />;
        case 'features':
            return <FeaturesRenderer data={data} isPreview={isPreview} viewport={viewport} />;
        case 'text':
            return <TextRenderer data={data} />;
        case 'form_embed':
            return <FormEmbedRenderer data={data} />;
        case 'blog_list':
            return <BlogListRenderer data={data} brand={brand} blogs={blogs} isPreview={isPreview} />;
        case 'blog_content':
            return <BlogContentRenderer blog={blog} brand={brand} isPreview={isPreview} />;
        default:
            return <div className="p-8 text-center text-zinc-400 italic">Unknown section type: {type}</div>;
    }
}
