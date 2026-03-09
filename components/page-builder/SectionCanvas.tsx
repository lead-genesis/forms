"use client";

import React from "react";
import { BrandPage, BrandSection } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import { ViewportMode } from "@/components/builder/ViewportToggle";
import { Star, Shield, Zap, Globe, Heart, Bell, Menu, X as XIcon } from "lucide-react";

interface SectionCanvasProps {
    sections: BrandSection[];
    currentSectionId: string | null;
    onSectionSelect: (id: string) => void;
    brand: any;
    brandPages?: BrandPage[];
    backgroundColor?: string;
    viewport: ViewportMode;
    isPreview?: boolean;
}

export function SectionCanvas({ sections, currentSectionId, onSectionSelect, brand, brandPages, backgroundColor, viewport, isPreview }: SectionCanvasProps) {
    return (
        <div className={cn(
            "bg-white flex flex-col transition-all duration-700 ease-in-out origin-top",
            !isPreview && "shadow-2xl shadow-black/5",
            viewport === "desktop" ? cn("w-full min-h-[120vh]", !isPreview && "max-w-5xl rounded-[32px]") :
                viewport === "tablet" ? "w-[768px] rounded-[36px] min-h-[1024px]" :
                    "w-[375px] rounded-[40px] min-h-[667px] scale-[0.85] md:scale-100"
        )} style={{ backgroundColor: backgroundColor || '#ffffff' }}>
            {/* Browser/Phone Header */}
            {!isPreview && (
                <div className="h-14 border-b border-zinc-50 flex items-center px-6 shrink-0 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                    </div>
                    <div className="mx-auto bg-zinc-100/80 px-4 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-zinc-300/50" />
                        <span className="text-[10px] font-medium text-zinc-400 tabular-nums lowercase tracking-tight">
                            {brand?.name?.toLowerCase().replace(/\s/g, '') || "brand"}.com
                        </span>
                    </div>
                </div>
            )}

            {/* Sections Area */}
            <div className="flex-1 flex flex-col">
                {sections.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-zinc-500 font-semibold">Empty Page</h3>
                            <p className="text-zinc-400 text-[13px]">Add sections from the bottom menu to start building.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => !isPreview && onSectionSelect(section.id)}
                                className={cn(
                                    "relative transition-all duration-300",
                                    !isPreview && "cursor-pointer group",
                                    !isPreview && (currentSectionId === section.id ? "z-[60]" : "hover:bg-zinc-50/50"),
                                    section.type === 'header' && "sticky top-0 z-[60]"
                                )}
                                style={{ backgroundColor: section.data?.backgroundColor }}
                            >
                                <SectionRenderer section={section} brand={brand} brandPages={brandPages} isPreview={isPreview} />

                                {currentSectionId === section.id && (
                                    <>
                                        {/* Selection Border Overlay */}
                                        <div className="absolute inset-0 border-[3px] border-zinc-900 z-[40] pointer-events-none" />
                                        <div className="absolute top-4 right-4 flex items-center gap-2 z-[50]">
                                            <div className="bg-zinc-900 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-xl">
                                                {section.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Hover Indicator */}
                                {!isPreview && (
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-zinc-100/50 transition-colors pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Site Footer Placeholder */}
            <div className="p-12 border-t border-zinc-50 bg-zinc-50/30">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">B</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                        © 2026 {brand?.name || "Brand Name"}. Built with Genesis Flow.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SectionRenderer({ section, brand, brandPages, isPreview }: { section: BrandSection; brand: any; brandPages?: BrandPage[]; isPreview?: boolean }) {
    const { data, type } = section;
    const iconsMap: Record<string, any> = {
        star: Star,
        shield: Shield,
        zap: Zap,
        globe: Globe,
        heart: Heart,
        bell: Bell,
    };

    switch (type) {
        case 'hero': {
            const orientation = data?.orientation || 'background';
            const imageUrl = data?.imageUrl;
            const fontColor = data?.fontColor || '#18181b';

            if (orientation === 'background') {
                return (
                    <div
                        className="py-32 px-12 text-center space-y-6 relative overflow-hidden min-h-[600px] flex flex-col justify-center items-center"
                        style={{ color: fontColor }}
                    >
                        {imageUrl && (
                            <div className="absolute inset-0">
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                        )}
                        <div className="relative z-[2] max-w-3xl space-y-6">
                            <h1 className="text-6xl font-black tracking-tight leading-[1.05]" style={{ color: imageUrl ? 'white' : fontColor }}>
                                {data?.heading || "Your Brand's Next Big Move"}
                            </h1>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed" style={{ color: imageUrl ? 'rgba(255,255,255,0.9)' : undefined }}>
                                {data?.subheading || "The ultimate platform for modern high-ticket lead generation. Start capturing better data today."}
                            </p>
                            {data?.buttonText && (
                                <div className="pt-4">
                                    <a
                                        href={data.buttonLink || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => !data.buttonLink && e.preventDefault()}
                                        className="inline-block bg-zinc-900 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-2xl active:scale-95 transition-all border border-white/10"
                                    >
                                        {data.buttonText}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }

            return (
                <div
                    className={cn(
                        "py-24 px-12 flex flex-col md:flex-row items-center gap-16 min-h-[500px]",
                        orientation === 'right' ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                    style={{ color: fontColor }}
                >
                    <div className="flex-1 space-y-8 text-left">
                        <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
                            {data?.heading || "Your Brand's Next Big Move"}
                        </h1>
                        <p className="text-lg opacity-80 leading-relaxed">
                            {data?.subheading || "The ultimate platform for modern high-ticket lead generation. Start capturing better data today."}
                        </p>
                        {data?.buttonText && (
                            <div className="pt-2">
                                <a
                                    href={data.buttonLink || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => !data.buttonLink && e.preventDefault()}
                                    className="inline-block bg-zinc-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                                >
                                    {data.buttonText}
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 w-full">
                        {imageUrl ? (
                            <div className="aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl shadow-zinc-200">
                                <img
                                    src={imageUrl}
                                    alt="Hero"
                                    className={cn(
                                        "w-full h-full object-cover transition-transform duration-700",
                                        !isPreview && "transform hover:scale-105"
                                    )}
                                />
                            </div>
                        ) : (
                            <div className="aspect-[4/3] rounded-[32px] bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 space-y-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m3 14 4-4 3 3 5-5 6 6" /></svg>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Add Hero Image</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        case 'header': {
            const navigation = data?.navigation || [];
            // In a real app we'd have the actual page routes/titles here.
            // For now we'll just show the placeholder links based on selection.
            return (
                <header className="h-20 px-8 md:px-12 flex items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        {brand?.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="h-8 w-auto" />
                        ) : (
                            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white scale-90">
                                <span className="text-[14px] font-black">{brand?.name?.[0] || 'B'}</span>
                            </div>
                        )}
                        <span className="font-bold text-zinc-900 tracking-tight">{brand?.name || "Brand"}</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {navigation.length > 0 ? (
                            navigation.map((pageId: string) => {
                                const page = brandPages?.find(p => p.id === pageId);
                                return (
                                    <span key={pageId} className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">
                                        {page?.title || 'Link'}
                                    </span>
                                );
                            })
                        ) : (
                            <>
                                <span className="text-[13px] font-medium text-zinc-400">Home</span>
                                <span className="text-[13px] font-medium text-zinc-400">About</span>
                                <span className="text-[13px] font-medium text-zinc-400">Contact</span>
                            </>
                        )}
                    </nav>

                    <div className="md:hidden">
                        <Menu className="w-6 h-6 text-zinc-400" />
                    </div>
                </header>
            );
        }
        case 'features': {
            const items = data?.items || [
                { title: "Smart Discovery", description: "Find the best opportunities with our AI-driven search engine.", icon: "zap" },
                { title: "Instant Access", description: "Get real-time updates and notifications whenever data changes.", icon: "globe" },
                { title: "Secure Vault", description: "Your data is protected by enterprise-grade encryption.", icon: "shield" }
            ];

            return (
                <div className="py-24 px-12">
                    {data?.heading && (
                        <h2 className="text-3xl font-black text-center text-zinc-900 mb-16 tracking-tight">{data.heading}</h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {items.map((item: any, i: number) => {
                            const Icon = iconsMap[item.icon] || Star;
                            return (
                                <div key={i} className={cn("space-y-5 text-center md:text-left", !isPreview && "group")}>
                                    <div className={cn(
                                        "w-14 h-14 rounded-[20px] bg-zinc-50 flex items-center justify-center text-zinc-900 mx-auto md:mx-0 shadow-sm border border-zinc-100 transition-all",
                                        !isPreview && "group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-xl group-hover:shadow-zinc-200"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-zinc-900 text-lg">{item.title || `Feature ${i + 1}`}</h3>
                                        <p className="text-[14px] text-zinc-500 leading-relaxed">
                                            {item.description || "A quick description of what makes this brand unique and why customers choose it."}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        case 'text': {
            const orientation = data?.orientation || 'left';
            const imageUrl = data?.imageUrl;

            if (orientation === 'background') {
                return (
                    <div className="relative overflow-hidden min-h-[400px] flex items-center justify-center text-center px-12 py-24">
                        {imageUrl && (
                            <div className="absolute inset-0">
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50" />
                            </div>
                        )}
                        <div className="relative z-10 max-w-3xl space-y-4">
                            <h2 className={cn("text-3xl font-bold", imageUrl ? "text-white" : "text-zinc-900")}>
                                {data?.title || "Focus on the content"}
                            </h2>
                            <p className={cn("leading-relaxed", imageUrl ? "text-white/90" : "text-zinc-500")}>
                                {data?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <div className={cn(
                    "py-16 px-12 flex flex-col md:flex-row items-center gap-12",
                    orientation === 'left' ? "md:flex-row" : "md:flex-row-reverse"
                )}>
                    <div className="flex-1 space-y-4 text-left">
                        <h2 className="text-3xl font-bold text-zinc-900">{data?.title || "Focus on the content"}</h2>
                        <p className="text-zinc-500 leading-relaxed">
                            {data?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                        </p>
                    </div>
                    {imageUrl && (
                        <div className="flex-1 w-full">
                            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200">
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        case 'form_embed':
            return (
                <div className="py-20 px-12 bg-zinc-50/50">
                    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-zinc-100 shadow-xl shadow-zinc-200/50">
                        <div className="space-y-6">
                            <div className="h-6 w-32 bg-zinc-100 rounded-lg animate-pulse" />
                            <div className="space-y-3">
                                <div className="h-12 w-full bg-zinc-50 rounded-xl border border-zinc-100" />
                                <div className="h-12 w-full bg-zinc-50 rounded-xl border border-zinc-100" />
                            </div>
                            <div className="h-12 w-full bg-zinc-900 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                                {data?.formId ? "View Form" : "Select a Form"}
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'blog_content':
            return (
                <div className="py-16 px-12 max-w-2xl mx-auto space-y-8">
                    <div className="h-64 w-full bg-zinc-100 rounded-[32px] overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m3 14 4-4 3 3 5-5 6 6" /></svg>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                            <span>Marketing</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-200" />
                            <span>March 5, 2026</span>
                        </div>
                        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">The future of lead generation is now.</h1>
                        <div className="prose prose-zinc leading-relaxed text-zinc-500">
                            Keep writing your amazing blog story here...
                        </div>
                    </div>
                </div>
            )
        default:
            return <div className="p-8 text-center text-zinc-400 italic">Unknown section type: {type}</div>;
    }
}
