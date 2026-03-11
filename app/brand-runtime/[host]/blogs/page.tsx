import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandByDomain } from "@/app/actions/brands";
import { getPublicBlogs } from "@/app/actions/blogs";
import { getPublicPageByType, getPublicBrandPages } from "@/app/actions/pages";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";

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

    const [{ data: page }, { data: blogs }, { data: brandPages }] = await Promise.all([
        getPublicPageByType(brand.id, "blog_list"),
        getPublicBlogs(brand.id),
        getPublicBrandPages(brand.id),
    ]);

    if (!page || page.sections.length === 0) {
        notFound();
    }

    return (
        <SectionCanvas
            sections={page.sections}
            currentSectionId={null}
            brand={brand}
            brandPages={brandPages}
            backgroundColor={page.background_color}
            viewport="desktop"
            isPreview={true}
            blogs={blogs}
        />
    );
}
