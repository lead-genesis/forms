"use client";

import React, { useState, useEffect } from "react";
import { getBrandPages, BrandPage } from "@/app/actions/pages";
import { useBrand } from "./layout";

export default function BrandRuntimePage() {
    const { brand, isLoading: isBrandLoading } = useBrand();
    const [isLoading, setIsLoading] = useState(true);
    const [indexPage, setIndexPage] = useState<BrandPage | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!brand?.id) return;

        (async () => {
            try {
                setIsLoading(true);
                // Fetch pages to find the index page
                const { data: pages } = await getBrandPages(brand.id);
                const index = pages?.find(p => p.slug === 'index' || p.type === 'landing');

                if (index) {
                    setIndexPage(index);
                } else {
                    setError("Landing page not found");
                }
            } catch (err) {
                console.error("Brand runtime page error:", err);
                setError("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [brand?.id]);

    if (isLoading || isBrandLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !indexPage) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Under Construction</h1>
                <p className="text-zinc-500">The landing page for {brand.name} is currently being prepared.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-20 px-6 text-center">
            <h1 className="text-6xl font-black mb-6 leading-tight tracking-tight text-black">{indexPage.title}</h1>
            <p className="text-2xl text-zinc-500 mb-12 max-w-2xl mx-auto">
                {brand.description}
            </p>

            <div className="p-16 bg-zinc-50 rounded-[3rem] border border-zinc-100 shadow-sm">
                <p className="text-zinc-400 font-medium italic text-lg">Landing page rendering engine coming soon...</p>
                <div className="flex gap-4 justify-center mt-8">
                    <div className="h-1 w-24 bg-zinc-200 rounded-full" />
                    <div className="h-1 w-8 bg-zinc-400 rounded-full" />
                    <div className="h-1 w-24 bg-zinc-200 rounded-full" />
                </div>
            </div>
        </div>
    );
}
