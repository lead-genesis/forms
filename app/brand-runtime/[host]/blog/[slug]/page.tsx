import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getBrandByDomain } from "@/app/actions/brands";
import { getBlogBySlug } from "@/app/actions/blogs";
import { TiptapRenderer } from "@/components/TiptapRenderer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

interface PageProps {
    params: Promise<{ host: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { host, slug } = await params;
    const decodedHost = decodeURIComponent(host);
    const { data: brand } = await getBrandByDomain(decodedHost);
    if (!brand) return {};

    const { data: blog } = await getBlogBySlug(brand.id, slug);
    if (!blog || !blog.is_published) return {};

    const blogUrl = `https://${brand.custom_domain || decodedHost}/blog/${slug}`;

    return {
        title: blog.title,
        description: blog.excerpt || undefined,
        alternates: {
            canonical: blogUrl,
        },
        openGraph: {
            title: blog.title,
            description: blog.excerpt || undefined,
            url: blogUrl,
            type: "article",
            publishedTime: blog.created_at,
            images: blog.featured_image ? [{ url: blog.featured_image }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.excerpt || undefined,
            images: blog.featured_image ? [blog.featured_image] : undefined,
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { host, slug } = await params;
    const { data: brand } = await getBrandByDomain(decodeURIComponent(host));

    if (!brand) notFound();

    const { data: blog } = await getBlogBySlug(brand.id, slug);

    if (!blog || !blog.is_published) notFound();

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
                </div>
            </footer>
        </article>
    );
}
