"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Star, Shield, Zap, Globe, Heart, Bell } from "lucide-react";

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
}

export const FeaturesRenderer = React.memo(({ data, isPreview }: FeaturesRendererProps) => {
    const type = data?.type || 'features';
    const items = data?.items || [
        { title: "Smart Discovery", description: "Find the best opportunities with our AI-driven search engine.", icon: "zap" },
        { title: "Instant Access", description: "Get real-time updates and notifications whenever data changes.", icon: "globe" },
        { title: "Secure Vault", description: "Your data is protected by enterprise-grade encryption.", icon: "shield" }
    ];

    return (
        <div className="py-24 px-12">
            {data?.heading && (
                <h2 className="text-3xl font-black text-center text-zinc-900 mb-16 tracking-tight">{data.heading}</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-20">
                {items.map((item: any, i: number) => {
                    const Icon = iconsMap[item.icon] || Star;
                    const stepNumber = (i + 1).toString().padStart(2, '0');

                    return (
                        <div key={i} className={cn("relative flex flex-col items-center md:items-start text-center md:text-left", !isPreview && "group")}>
                            {type === 'steps' && (
                                <div className="absolute -top-8 -right-4 text-9xl font-black text-zinc-100/50 select-none pointer-events-none z-0">
                                    {stepNumber}
                                </div>
                            )}
                            <div className="relative z-10 space-y-5 w-full">
                                <div className={cn(
                                    "w-14 h-14 rounded-[20px] bg-zinc-50 flex items-center justify-center text-zinc-900 mx-auto md:mx-0 shadow-sm border border-zinc-100 transition-all",
                                    !isPreview && "group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-xl group-hover:shadow-zinc-200"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-zinc-900 text-lg">{item.title || `Feature ${i + 1}`}</h3>
                                    <p className="text-[14px] text-zinc-500 leading-relaxed">
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
