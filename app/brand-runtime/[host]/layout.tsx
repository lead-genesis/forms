import React from "react";
import { Metadata } from "next";
import { getBrandByDomain } from "@/app/actions/brands";
import { getPublicBrandPages } from "@/app/actions/pages";
import { BrandRuntimeShell } from "./BrandRuntimeShell";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ host: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
    const { host } = await params;
    const decodedHost = decodeURIComponent(host);
    const { data: brand } = await getBrandByDomain(decodedHost);

    if (!brand) return { title: { absolute: "Site Not Found" } };

    const baseUrl = `https://${brand.custom_domain || decodedHost}`;

    const title = brand.seo_title || brand.name;
    const description = brand.seo_description || brand.description || undefined;
    const ogImage = brand.og_image_url || brand.logo_url || undefined;

    return {
        metadataBase: new URL(baseUrl),
        title: {
            absolute: title,
            template: `%s | ${brand.name}`,
        },
        description,
        icons: brand.logo_url ? { icon: brand.logo_url } : undefined,
        alternates: {
            canonical: baseUrl,
        },
        openGraph: {
            siteName: brand.name,
            title,
            description,
            url: baseUrl,
            type: "website",
            locale: "en_US",
            ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            site: brand.name,
            title,
            description,
            ...(ogImage ? { images: [ogImage] } : {}),
        },
    };
}

export default async function BrandRuntimeLayout({ children, params }: LayoutProps) {
    const { host } = await params;
    const { data: brand, error } = await getBrandByDomain(decodeURIComponent(host));

    if (error || !brand) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center space-y-3 max-w-sm px-6">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl mx-auto flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Site Not Found</h1>
                    <p className="text-sm text-muted-foreground">We couldn&apos;t find the site you were looking for.</p>
                </div>
            </div>
        );
    }

    const { data: brandPages } = await getPublicBrandPages(brand.id);

    return (
        <BrandRuntimeShell brand={brand} brandPages={brandPages}>
            {children}
        </BrandRuntimeShell>
    );
}
