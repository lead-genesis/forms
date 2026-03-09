"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextRendererProps {
    data: any;
}

export const TextRenderer = React.memo(({ data }: TextRendererProps) => {
    const orientation = data?.orientation || 'left';
    const imageUrl = data?.imageUrl;

    if (orientation === 'background') {
        return (
            <div className="relative overflow-hidden min-h-[320px] sm:min-h-[400px] flex items-center justify-center text-center px-4 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
                {imageUrl && (
                    <div className="absolute inset-0">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50" />
                    </div>
                )}
                <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
                    <h2 className={cn("text-2xl sm:text-3xl font-bold", imageUrl ? "text-white" : "text-zinc-900")}>
                        {data?.title || "Focus on the content"}
                    </h2>
                    <p className={cn("text-sm sm:text-base leading-relaxed", imageUrl ? "text-white/90" : "text-zinc-500")}>
                        {data?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "py-10 sm:py-12 lg:py-16 px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center gap-8 sm:gap-10 lg:gap-12",
            orientation === 'left' ? "md:flex-row" : "md:flex-row-reverse"
        )}>
            <div className="flex-1 space-y-3 sm:space-y-4 text-left min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">{data?.title || "Focus on the content"}</h2>
                <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
                    {data?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                </p>
            </div>
            {imageUrl && (
                <div className="flex-1 w-full min-w-0">
                    <div className="aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                </div>
            )}
        </div>
    );
});

TextRenderer.displayName = "TextRenderer";
