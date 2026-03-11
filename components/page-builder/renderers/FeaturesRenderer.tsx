"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Star, Shield, Zap, Globe, Heart, Bell } from "lucide-react";
import { ViewportMode } from "@/components/builder/ViewportToggle";

const iconsMap: Record<string, any> = {
    star: Star,
    shield: Shield,
    zap: Zap,
    globe: Globe,
    heart: Heart,
    bell: Bell,
};

interface FeaturesRendererProps {
    data: any;
    isPreview?: boolean;
    viewport?: ViewportMode;
}

export const FeaturesRenderer = React.memo(({ data, isPreview, viewport }: FeaturesRendererProps) => {
    const isMobileViewport = viewport === "mobile" || viewport === "tablet";
    const type = data?.type || 'features';
    const items = data?.items || [
        { title: "Smart Discovery", description: "Find the best opportunities with our AI-driven search engine.", icon: "zap" },
        { title: "Instant Access", description: "Get real-time updates and notifications whenever data changes.", icon: "globe" },
        { title: "Secure Vault", description: "Your data is protected by enterprise-grade encryption.", icon: "shield" }
    ];

    return (
        <div className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 max-w-6xl mx-auto overflow-hidden">
            {data?.heading && (
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-center text-zinc-900 mb-8 sm:mb-10 md:mb-12 lg:mb-16 tracking-tight px-2">
                    {data.heading}
                </h2>
            )}
            <div className={cn(
                "grid gap-8",
                isMobileViewport
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-10 md:gap-x-12 lg:gap-x-16 md:gap-y-16 lg:gap-y-20"
            )}>
                {items.map((item: any, i: number) => {
                    const Icon = iconsMap[item.icon] || Star;
                    const stepNumber = (i + 1).toString().padStart(2, '0');

                    return (
                        <div
                            key={i}
                            className={cn(
                                "relative flex flex-col items-center md:items-start text-center md:text-left min-w-0",
                                !isPreview && "group"
                            )}
                        >
                            {type === 'steps' && (
                                <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-3 md:-top-8 md:-right-4 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-zinc-100/50 select-none pointer-events-none z-0 leading-none">
                                    {stepNumber}
                                </div>
                            )}
                            <div className="relative z-10 space-y-3 sm:space-y-4 md:space-y-5 w-full min-w-0">
                                <div
                                    className={cn(
                                        "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[20px] bg-zinc-50 flex items-center justify-center text-zinc-900 mx-auto md:mx-0 shadow-sm border border-zinc-100 transition-all flex-shrink-0",
                                        !isPreview && "group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-xl group-hover:shadow-zinc-200"
                                    )}
                                >
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2 min-w-0">
                                    <h3 className="font-bold text-zinc-900 text-sm sm:text-base md:text-lg break-words">
                                        {item.title || `Feature ${i + 1}`}
                                    </h3>
                                    <p className="text-xs sm:text-sm md:text-[14px] text-zinc-500 leading-relaxed break-words">
                                        {item.description || "A quick description of what makes this brand unique and why customers choose it."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

FeaturesRenderer.displayName = "FeaturesRenderer";
