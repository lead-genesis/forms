import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandByDomain } from "@/app/actions/brands";
import { getPublicPageBySlug, getPublicBrandPages } from "@/app/actions/pages";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";

interface PageProps {
    params: Promise<{ host: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { host, slug } = await params;
    const decodedHost = decodeURIComponent(host);
    const { data: brand } = await getBrandByDomain(decodedHost);
    if (!brand) return {};

    const { data: page } = await getPublicPageBySlug(brand.id, slug);
    if (!page) return {};

    const title = page.seo_title || page.title;
    const description = page.seo_description || brand.description || undefined;
    const pageUrl = `https://${brand.custom_domain || decodedHost}/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title,
            description: description || undefined,
            url: pageUrl,
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

export default async function BrandRuntimeSlugPage({ params }: PageProps) {
    const { host, slug } = await params;
    const { data: brand } = await getBrandByDomain(decodeURIComponent(host));

    if (!brand) notFound();

    const [{ data: page }, { data: brandPages }] = await Promise.all([
        getPublicPageBySlug(brand.id, slug),
        getPublicBrandPages(brand.id),
    ]);

    if (!page) notFound();

    return (
        <SectionCanvas
            sections={page.sections}
            currentSectionId={null}
            onSectionSelect={() => {}}
            brand={brand}
            brandPages={brandPages}
            backgroundColor={page.background_color}
            viewport="desktop"
            isPreview={true}
        />
    );
}
