import React from "react";
import { Metadata } from "next";
import { getBrandByDomain } from "@/app/actions/brands";
import { getPublicIndexPage, getPublicBrandPages } from "@/app/actions/pages";
import { getPublicBlogs } from "@/app/actions/blogs";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ host: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { host } = await params;
    const decodedHost = decodeURIComponent(host);
    const { data: brand } = await getBrandByDomain(decodedHost);
    if (!brand) return {};

    const { data: page } = await getPublicIndexPage(brand.id);
    if (!page) return {};

    const title = page.seo_title || page.title;
    const description = page.seo_description || brand.description || undefined;
    const baseUrl = `https://${brand.custom_domain || decodedHost}`;

    return {
        title,
        description,
        alternates: {
            canonical: baseUrl,
        },
        openGraph: {
            title,
            description: description || undefined,
            url: baseUrl,
            images: page.og_image_url ? [{ url: page.og_image_url }] : undefined,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: description || undefined,
            images: page.og_image_url ? [page.og_image_url] : undefined,
        },
    };
}

export default async function BrandRuntimeHomePage({ params }: PageProps) {
    const { host } = await params;
    const { data: brand } = await getBrandByDomain(decodeURIComponent(host));

    if (!brand) notFound();

    const [{ data: indexPage }, { data: brandPages }, { data: blogs }] = await Promise.all([
        getPublicIndexPage(brand.id),
        getPublicBrandPages(brand.id),
        getPublicBlogs(brand.id),
    ]);

    if (!indexPage) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Under Construction</h1>
                <p className="text-zinc-500">The landing page for {brand.name} is currently being prepared.</p>
            </div>
        );
    }

    return (
        <SectionCanvas
            sections={indexPage.sections}
            currentSectionId={null}
            brand={brand}
            brandPages={brandPages}
            blogs={blogs}
            backgroundColor={indexPage.background_color}
            viewport="desktop"
            isPreview={false}
        />
    );
}
