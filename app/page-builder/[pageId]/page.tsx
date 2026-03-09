"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBrandPages, BrandPage, BrandSection, getPageWithSections, updatePage, createSection, updateSection, deleteSection, reorderSections } from "@/app/actions/pages";
import { getBrand } from "@/app/actions/brands";
import { getBrandForms, Form as BrandForm } from "@/app/actions/forms";
import { PageBuilderHeader } from "@/components/page-builder/PageBuilderHeader";
import { cn } from "@/lib/utils";
import { SectionList } from "@/components/page-builder/SectionList";
import { SectionCanvas } from "@/components/page-builder/SectionCanvas";
import { SectionConfig } from "@/components/page-builder/SectionConfig";
import { ViewportToggle, ViewportMode } from "@/components/builder/ViewportToggle";

import { PageSettings } from "@/components/page-builder/PageSettings";

export default function PageBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.pageId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState<BrandPage & { sections: BrandSection[] } | null>(null);
    const [brand, setBrand] = useState<any>(null);
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
    const [showPageSettings, setShowPageSettings] = useState(true);
    const [viewport, setViewport] = useState<ViewportMode>("desktop");
    const [brandPages, setBrandPages] = useState<BrandPage[]>([]);
    const [brandForms, setBrandForms] = useState<BrandForm[]>([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: pageData, error: pageError } = await getPageWithSections(pageId);

            if (pageError) {
                toast.error(pageError);
                router.push("/dashboard/brands");
                return;
            }

            if (pageData) {
                setPage(pageData);
                if (pageData.sections.length > 0) {
                    setCurrentSectionId(pageData.sections[0].id);
                }

                const { data: brandData } = await getBrand(pageData.brand_id);
                if (brandData) {
                    setBrand(brandData);
                }

                const { data: pages } = await getBrandPages(pageData.brand_id);
                setBrandPages(pages || []);

                const { data: forms } = await getBrandForms(pageData.brand_id);
                setBrandForms(forms || []);
            }
        } catch (err: any) {
            console.error("fetchData error:", err);
            toast.error("Failed to load page data");
        } finally {
            setIsLoading(false);
        }
    }, [pageId, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdatePage = async (updates: Partial<BrandPage>) => {
        if (!page) return;
        setPage({ ...page, ...updates });

        // Also update the title in brandPages if it's there
        if (updates.title) {
            setBrandPages(prev => prev.map(p => p.id === page.id ? { ...p, title: updates.title! } : p));
        }

        const { error } = await updatePage(page.id, updates);
        if (error) toast.error(error);
    };

    const handleAddSection = async (type: BrandSection['type']) => {
        if (!page) return;
        const order = page.sections.length;
        const { data, error } = await createSection(page.id, type, order);

        if (error) {
            toast.error(error);
            return;
        }

        if (data) {
            setPage({
                ...page,
                sections: [...page.sections, data]
            });
            setCurrentSectionId(data.id);
            toast.success("Section added!");
        }
    };

    const handleUpdateSection = async (sectionId: string, updates: Partial<BrandSection>) => {
        if (!page) return;

        setPage({
            ...page,
            sections: page.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
        });

        const { error } = await updateSection(sectionId, updates);
        if (error) toast.error(error);
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!page) return;

        const { error } = await deleteSection(sectionId);
        if (error) {
            toast.error(error);
            return;
        }

        setPage({
            ...page,
            sections: page.sections.filter(s => s.id !== sectionId)
        });

        if (currentSectionId === sectionId) {
            setCurrentSectionId(page.sections.find(s => s.id !== sectionId)?.id || null);
        }
        toast.success("Section removed");
    };

    const handleReorderSections = async (newSections: BrandSection[]) => {
        if (!page) return;

        setPage({ ...page, sections: newSections });

        const updates = newSections.map((s, i) => ({ id: s.id, order: i }));
        const { error } = await reorderSections(updates);
        if (error) toast.error(error);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading Page Builder…</p>
                </div>
            </div>
        );
    }

    if (!page) return null;

    const currentSection = page.sections.find(s => s.id === currentSectionId);

    return (
        <div className="flex flex-col h-screen bg-zinc-50/50">
            {/* Header */}
            <PageBuilderHeader
                title={page.title}
                onTitleChange={(title) => handleUpdatePage({ title })}
                onBack={() => router.push(`/dashboard/brands/${page.brand_id}`)}
                status={page.is_published ? "Published" : "Draft"}
                lastSaved={new Date(page.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                onOpenSettings={() => {
                    setShowPageSettings(!showPageSettings);
                }}
                pageId={page.id}
                brandPages={brandPages}
                onPageSelect={(pageId) => router.push(`/page-builder/${pageId}`)}
            />

            <main className="flex-1 flex overflow-hidden relative">
                {/* Configuration Panel (Left) */}
                <aside className="w-[360px] min-w-[360px] bg-white border-r border-zinc-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-hidden shrink-0">
                    <div className="flex-1 overflow-y-auto">
                        {currentSection ? (
                            <SectionConfig
                                section={currentSection}
                                brandPages={brandPages}
                                brandForms={brandForms}
                                onChange={(updates) => handleUpdateSection(currentSection.id, updates)}
                                onDelete={() => handleDeleteSection(currentSection.id)}
                                onClose={() => setCurrentSectionId(null)}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 h-full">
                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-zinc-600 font-bold text-sm">No section selected</h3>
                                    <p className="text-zinc-400 text-xs">Click on any section in the canvas or list to edit its content.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Canvas Area (Center) */}
                <div
                    className="flex-1 relative flex flex-col items-center overflow-hidden bg-zinc-50/10"
                    style={{ backgroundColor: page?.background_color ? `${page.background_color}10` : undefined }}
                >
                    <div className="absolute top-8 left-8 z-50">
                        <ViewportToggle viewport={viewport} setViewport={setViewport} />
                    </div>

                    <div className="flex-1 w-full overflow-y-auto p-12 custom-scrollbar scroll-smooth transition-all duration-500">
                        <div className="w-full flex justify-center">
                            <SectionCanvas
                                sections={page.sections}
                                currentSectionId={currentSectionId}
                                onSectionSelect={(id) => {
                                    setCurrentSectionId(id);
                                }}
                                brand={brand}
                                brandPages={brandPages}
                                brandForms={brandForms}
                                backgroundColor={page?.background_color}
                                viewport={viewport}
                            />
                        </div>
                    </div>
                </div>

                {/* Page Settings Panel (Right) */}
                {showPageSettings && (
                    <aside className="w-[360px] min-w-[360px] bg-white border-l border-zinc-100 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10 shrink-0">
                        <PageSettings
                            page={page}
                            onChange={handleUpdatePage}
                            onClose={() => setShowPageSettings(false)}
                        />
                    </aside>
                )}
            </main>

            {/* Bottom Section List (Horizontal Pill) - Centered */}
            <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
                <SectionList
                    sections={page.sections}
                    currentSectionId={currentSectionId}
                    onSectionSelect={(id) => {
                        setCurrentSectionId(id);
                    }}
                    onAddSection={handleAddSection}
                    onSectionsReorder={handleReorderSections}
                />
            </footer>
        </div>
    );
}
