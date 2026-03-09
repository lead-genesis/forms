"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface BlogItem {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image?: string | null;
    created_at: string;
}

interface BlogListRendererProps {
    data?: {
        heading?: string;
        description?: string;
    };
    brand?: any;
    blogs?: BlogItem[];
    isPreview?: boolean;
}

const PLACEHOLDER_BLOGS: BlogItem[] = [
    { id: "1", title: "The future of lead generation is now", slug: "#", excerpt: "Discover new strategies to grow your audience and convert more visitors into loyal customers.", featured_image: null, created_at: new Date().toISOString() },
    { id: "2", title: "5 tips for building landing pages that convert", slug: "#", excerpt: "Learn the proven techniques top marketers use to boost their conversion rates.", featured_image: null, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "3", title: "Why your brand story matters more than ever", slug: "#", excerpt: "In a crowded market, your brand story is your biggest competitive advantage.", featured_image: null, created_at: new Date(Date.now() - 172800000).toISOString() },
];

function BlogCard({ blog, isPlaceholder }: { blog: BlogItem; isPlaceholder?: boolean }) {
    const inner = (
        <>
            <div className="aspect-[16/10] bg-zinc-100 rounded-[2.5rem] overflow-hidden border border-zinc-100 relative">
                {blog.featured_image ? (
                    <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <DocumentTextIcon className="w-12 h-12 text-zinc-200" />
                    </div>
                )}
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    <span>{format(new Date(blog.created_at), "MMM d, yyyy")}</span>
                </div>
                <h3 className={cn("text-2xl font-bold text-black leading-tight group-hover:text-zinc-600 transition-colors", sansFont)}>
                    {blog.title}
                </h3>
                {blog.excerpt && (
                    <p className="text-zinc-500 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                    </p>
                )}
                <div className="pt-2">
                    <span className="text-sm font-black text-black inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read Article
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                </div>
            </div>
        </>
    );

    if (isPlaceholder) {
        return <div className="group block space-y-6">{inner}</div>;
    }

    return (
        <Link href={`/blog/${blog.slug}`} className="group block space-y-6">
            {inner}
        </Link>
    );
}

export const BlogListRenderer = React.memo(({ data, brand, blogs, isPreview }: BlogListRendererProps) => {
    const heading = data?.heading || "Blog";
    const description = data?.description || (brand ? `Insights, stories, and updates from the ${brand.name} team.` : "Insights, stories, and updates from our team.");

    const displayBlogs = isPreview ? (blogs ?? []) : PLACEHOLDER_BLOGS;
    const isPlaceholder = !isPreview;

    return (
        <div className="max-w-6xl mx-auto px-6 py-20">
            <header className="max-w-3xl mb-20">
                <h1 className={cn("text-6xl font-black mb-6 tracking-tight text-black", sansFont)}>{heading}</h1>
                <p className="text-xl text-zinc-500">{description}</p>
            </header>

            {isPreview && displayBlogs.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-[3rem] border border-zinc-100">
                    <DocumentTextIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-zinc-400">No posts yet</h2>
                    <p className="text-zinc-400">Check back soon for new content.</p>
                </div>
            ) : (
                <div className="relative">
                    {isPlaceholder && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            <div className="bg-zinc-900/90 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-xl">
                                Blog posts appear here automatically
                            </div>
                        </div>
                    )}
                    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12", isPlaceholder && "opacity-60")}>
                        {displayBlogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} isPlaceholder={isPlaceholder} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

BlogListRenderer.displayName = "BlogListRenderer";
