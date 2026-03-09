"use client";

import React from "react";

export const BlogContentRenderer = React.memo(() => {
    return (
        <div className="py-16 px-12 max-w-2xl mx-auto space-y-8">
            <div className="h-64 w-full bg-zinc-100 rounded-[32px] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m3 14 4-4 3 3 5-5 6 6" /></svg>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Marketing</span>
                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
                    <span>March 5, 2026</span>
                </div>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight">The future of lead generation is now.</h1>
                <div className="prose prose-zinc leading-relaxed text-zinc-500">
                    Keep writing your amazing blog story here...
                </div>
            </div>
        </div>
    );
});

BlogContentRenderer.displayName = "BlogContentRenderer";
