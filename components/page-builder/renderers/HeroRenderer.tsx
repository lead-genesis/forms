"use client";

import React from "react";
import { cn } from "@/lib/utils";

import { BrandPage } from "@/app/actions/pages";
import { ViewportMode } from "@/components/builder/ViewportToggle";

interface HeroRendererProps {
    data: any;
    fontColor: string;
    imageUrl?: string;
    isPreview?: boolean;
    brandPages?: BrandPage[];
    brandForms?: any[];
    viewport?: ViewportMode;
}

export const HeroRenderer = React.memo(({ data, fontColor, imageUrl, isPreview, brandPages, brandForms, viewport }: HeroRendererProps) => {
    const orientation = data?.orientation || 'background';

    const getButtonHref = () => {
        const link = data?.buttonLink;
        const type = data?.buttonLinkType || 'external';

        if (!link) return "#";
        if (type === 'external') return link;
        if (type === 'page') return `/${link}`;
        if (type === 'form') return `/f/${link}`;
        return link;
    };

    const buttonHref = getButtonHref();

    if (orientation === 'background') {
        return (
            <div
                className="relative overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex flex-col justify-center items-center w-full"
                style={{ color: fontColor }}
            >
                {imageUrl && (
                    <div className="absolute inset-0 flex justify-center">
                        <div className="w-full max-w-[1200px] relative">
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    </div>
                )}
                <div className="relative z-[2] max-w-[1200px] mx-auto w-full py-16 sm:py-24 lg:py-32 px-4 sm:px-8 lg:px-12 text-center flex flex-col items-center space-y-4 sm:space-y-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]" style={{ color: imageUrl ? 'white' : fontColor }}>
                        {data?.heading || "Your Brand's Next Big Move"}
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed" style={{ color: imageUrl ? 'rgba(255,255,255,0.9)' : undefined }}>
                        {data?.subheading || "The ultimate platform for modern high-ticket lead generation. Start capturing better data today."}
                    </p>
                    {data?.buttonText && (
                        <div className="pt-2 sm:pt-4">
                            <a
                                href={buttonHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => buttonHref === "#" && e.preventDefault()}
                                className="inline-block bg-zinc-900 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-bold text-sm shadow-2xl active:scale-95 transition-all border border-white/10"
                            >
                                {data.buttonText}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full" style={{ backgroundColor: data?.backgroundColor }}>
            <div
                className={cn(
                    "max-w-[1200px] mx-auto py-12 sm:py-16 lg:py-24 px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center gap-8 sm:gap-12 lg:gap-16 min-h-[400px] sm:min-h-[500px]",
                    orientation === 'right' ? "md:flex-row" : "md:flex-row-reverse"
                )}
                style={{ color: fontColor }}
            >
                <div className="flex-1 space-y-4 sm:space-y-6 lg:space-y-8 text-left min-w-0">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                        {data?.heading || "Your Brand's Next Big Move"}
                    </h1>
                    <p className="text-base sm:text-lg opacity-80 leading-relaxed">
                        {data?.subheading || "The ultimate platform for modern high-ticket lead generation. Start capturing better data today."}
                    </p>
                    {data?.buttonText && (
                        <div className="pt-2">
                            <a
                                href={buttonHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => buttonHref === "#" && e.preventDefault()}
                                className="inline-block bg-zinc-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm shadow-xl active:scale-95 transition-all"
                            >
                                {data.buttonText}
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex-1 w-full min-w-0">
                    {imageUrl ? (
                        <div className="aspect-[4/3] rounded-2xl sm:rounded-[28px] lg:rounded-[32px] overflow-hidden shadow-2xl shadow-zinc-200">
                            <img
                                src={imageUrl}
                                alt="Hero"
                                className={cn(
                                    "w-full h-full object-cover transition-transform duration-700",
                                    !isPreview && "transform hover:scale-105"
                                )}
                            />
                        </div>
                    ) : (
                        <div className="aspect-[4/3] rounded-2xl sm:rounded-[28px] lg:rounded-[32px] bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m3 14 4-4 3 3 5-5 6 6" /></svg>
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Add Hero Image</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

HeroRenderer.displayName = "HeroRenderer";
