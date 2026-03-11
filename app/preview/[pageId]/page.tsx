"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageWithSections, getBrandPages, BrandPage, BrandSection } from "@/app/actions/pages";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";
import { Loader2 } from "lucide-react";

export default function PreviewPage() {
    const { pageId } = useParams();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<any>(null);
    const [brandPages, setBrandPages] = useState<BrandPage[]>([]);

    useEffect(() => {
        const load = async () => {
            const { data, error } = await getPageWithSections(pageId as string);
            if (data) {
                setPage(data);
                const { data: pages } = await getBrandPages(data.brand_id);
                setBrandPages(pages || []);
            }
            setLoading(false);
        };
        load();
    }, [pageId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-zinc-400">Page not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center transition-all duration-500 w-full overflow-x-hidden" style={{ backgroundColor: page.background_color || '#ffffff' }}>
            {/* Centered container with max-width 1200px, responsive padding */}
            <div className="w-full max-w-[1200px] min-w-0 px-0 sm:px-4">
                <SectionCanvas
                    sections={page.sections}
                    currentSectionId={null}
                    onSectionSelect={() => { }}
                    brand={page.brand}
                    brandPages={brandPages}
                    backgroundColor={page.background_color}
                    viewport="desktop"
                    isRuntime={true}
                    isPreview={true}
                />
            </div>
        </div>
    );
}
