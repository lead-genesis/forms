import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandByDomain } from "@/app/actions/brands";
import { getBlogBySlug } from "@/app/actions/blogs";
import { getPublicPageByType, getPublicBrandPages } from "@/app/actions/pages";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";

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

    const [{ data: blog }, { data: templatePage }, { data: brandPages }] = await Promise.all([
        getBlogBySlug(brand.id, slug),
        getPublicPageByType(brand.id, "blog"),
        getPublicBrandPages(brand.id),
    ]);

    if (!blog || !blog.is_published) notFound();

    if (!templatePage || templatePage.sections.length === 0) {
        notFound();
    }

    return (
        <SectionCanvas
            sections={templatePage.sections}
            currentSectionId={null}
            onSectionSelect={() => {}}
            brand={brand}
            brandPages={brandPages}
            backgroundColor={templatePage.background_color}
            viewport="desktop"
            isPreview={true}
            blog={blog}
        />
    );
}
