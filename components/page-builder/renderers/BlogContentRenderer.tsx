"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { TiptapRenderer } from "@/components/TiptapRenderer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BlogData {
    title: string;
    slug: string;
    content: any;
    excerpt?: string | null;
    featured_image?: string | null;
    created_at: string;
}

interface BlogContentRendererProps {
    blog?: BlogData | null;
    brand?: any;
    isPreview?: boolean;
}

function PlaceholderView() {
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
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="bg-zinc-900/90 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-xl">
                    Blog post content renders here automatically
                </div>
            </div>
        </div>
    );
}

function LiveView({ blog, brand }: { blog: BlogData; brand?: any }) {
    return (
        <article className="max-w-4xl mx-auto px-6 py-20">
            <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-12 text-sm font-bold uppercase tracking-widest"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Blog
            </Link>

            <header className="mb-16 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-zinc-400 uppercase tracking-widest">
                        <span>{format(new Date(blog.created_at), "MMMM d, yyyy")}</span>
                    </div>
                    <h1 className={cn("text-5xl md:text-6xl font-black text-black leading-[1.1] tracking-tight", sansFont)}>
                        {blog.title}
                    </h1>
                </div>

                {blog.excerpt && (
                    <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl">
                        {blog.excerpt}
                    </p>
                )}

                {blog.featured_image && (
                    <div className="pt-8">
                        <div className="aspect-[16/9] w-full rounded-[3rem] overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200">
                            <img
                                src={blog.featured_image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}
            </header>

            <div className="max-w-3xl mx-auto">
                <TiptapRenderer content={blog.content} />
            </div>

            {brand && (
                <footer className="mt-24 pt-12 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold uppercase tracking-tighter overflow-hidden">
                                {brand.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                                ) : (
                                    brand.name?.[0]
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black uppercase tracking-widest">{brand.name} team</p>
                                <p className="text-xs text-zinc-400">Published in {brand.name} Blog</p>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </article>
    );
}

export const BlogContentRenderer = React.memo(({ blog, brand, isPreview }: BlogContentRendererProps) => {
    if (isPreview && blog) {
        return <LiveView blog={blog} brand={brand} />;
    }

    return (
        <div className="relative">
            <PlaceholderView />
        </div>
    );
});

BlogContentRenderer.displayName = "BlogContentRenderer";
