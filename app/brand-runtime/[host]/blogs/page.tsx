import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getBrandByDomain } from "@/app/actions/brands";
import { getPublicBlogs } from "@/app/actions/blogs";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface PageProps {
    params: Promise<{ host: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { host } = await params;
    const decodedHost = decodeURIComponent(host);
    const { data: brand } = await getBrandByDomain(decodedHost);
    if (!brand) return {};

    const blogsUrl = `https://${brand.custom_domain || decodedHost}/blogs`;
    const description = `Insights, stories, and updates from the ${brand.name} team.`;

    return {
        title: "Blog",
        description,
        alternates: {
            canonical: blogsUrl,
        },
        openGraph: {
            title: `Blog — ${brand.name}`,
            description,
            url: blogsUrl,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `Blog — ${brand.name}`,
            description,
        },
    };
}

export default async function BlogListingPage({ params }: PageProps) {
    const { host } = await params;
    const { data: brand } = await getBrandByDomain(decodeURIComponent(host));

    if (!brand) notFound();

    const { data: blogs } = await getPublicBlogs(brand.id);

    return (
        <div className="max-w-6xl mx-auto px-6 py-20">
            <header className="max-w-3xl mb-20">
                <h1 className={cn("text-6xl font-black mb-6 tracking-tight text-black", sansFont)}>Blog</h1>
                <p className="text-xl text-zinc-500">
                    Insights, stories, and updates from the {brand.name} team.
                </p>
            </header>

            {blogs.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-[3rem] border border-zinc-100">
                    <DocumentTextIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-zinc-400">No posts yet</h2>
                    <p className="text-zinc-400">Check back soon for new content.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {blogs.map((blog) => (
                        <Link
                            key={blog.id}
                            href={`/blog/${blog.slug}`}
                            className="group block space-y-6"
                        >
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
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
