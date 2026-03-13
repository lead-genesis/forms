// Triggering new Vercel build
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getPageWithSections, getBrandPages } from "@/app/actions/pages";
import { getBlogs } from "@/app/actions/blogs";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";

interface PageProps {
    params: Promise<{ pageId: string }>;
}

export default async function PreviewPage({ params }: PageProps) {
    const { pageId } = await params;

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-zinc-400">Page unavailable. Please sign in to preview pages.</p>
            </div>
        );
    }

    const { data: page } = await getPageWithSections(pageId);

    if (!page) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-zinc-400">Page not found.</p>
            </div>
        );
    }

    const [{ data: brandPages }, { data: blogs }] = await Promise.all([
        getBrandPages(page.brand_id),
        getBlogs(page.brand_id),
    ]);

    return (
        <div className="min-h-screen flex flex-col items-center transition-all duration-500 w-full overflow-x-hidden" style={{ backgroundColor: page.background_color || '#ffffff' }}>
            <div className="w-full max-w-[1200px] min-w-0 px-0 sm:px-4">
                <SectionCanvas
                    sections={page.sections}
                    currentSectionId={null}
                    brand={page.brand}
                    brandPages={brandPages || []}
                    backgroundColor={page.background_color}
                    viewport="desktop"
                    isRuntime={true}
                    isPreview={true}
                    blogs={blogs || []}
                />
            </div>
        </div>
    );
}
