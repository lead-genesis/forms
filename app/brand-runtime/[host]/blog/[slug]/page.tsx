"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { getBlogBySlug } from "@/app/actions/blogs";
import { useBrand } from "../../layout";
import { TiptapRenderer } from "@/components/TiptapRenderer";
import { format } from "date-fns";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { brand, isLoading: isBrandLoading } = useBrand();

    const [blog, setBlog] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!brand?.id || !slug) return;

        (async () => {
            try {
                setIsLoading(true);
                const { data, error: blogError } = await getBlogBySlug(brand.id, slug);

                if (blogError || !data) {
                    setError("Article not found");
                    return;
                }

                // If not published, don't show on public side
                if (!data.is_published) {
                    setError("Article not found");
                    return;
                }

                setBlog(data);
            } catch (err) {
                console.error("Error fetching blog:", err);
                setError("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [brand?.id, slug]);

    if (isLoading || isBrandLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-black animate-spin" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="max-w-4xl mx-auto py-40 px-6 text-center">
                <h1 className="text-3xl font-bold mb-4">{error}</h1>
                <Link href="/blogs" className="text-primary hover:underline inline-flex items-center gap-2">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Articles
                </Link>
            </div>
        );
    }

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

            <footer className="mt-24 pt-12 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 font-bold uppercase tracking-tighter overflow-hidden">
                            {brand.logo_url ? (
                                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                            ) : (
                                brand.name[0]
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-black uppercase tracking-widest">{brand.name} team</p>
                            <p className="text-xs text-zinc-400">Published in {brand.name} Blog</p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-sm font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-widest"
                    >
                        Back to top
                    </button>
                </div>
            </footer>
        </article>
    );
}
