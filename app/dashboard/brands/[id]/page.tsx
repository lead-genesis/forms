"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { useParams } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { sansFont } from "@/lib/design-system";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getBrand, updateBrand } from "@/app/actions/brands";
import { getVerticals } from "@/app/actions/verticals";
import { toast } from "sonner";
import Link from "next/link";
import { Save, Upload, Loader2, X, ArrowLeft } from "lucide-react";
import { uploadPageImage } from "@/app/actions/pages";
import { AddVerticalModal } from "@/components/dashboard/AddVerticalModal";

interface Vertical {
    id: string;
    name: string;
    created_at: string;
}

export default function BrandDetailsPage() {
    const params = useParams();
    const brandId = params.id as string;

    const [brand, setBrand] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Settings state
    const [brandName, setBrandName] = useState("");
    const [brandDesc, setBrandDesc] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
    const [verticalDropdownOpen, setVerticalDropdownOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Verticals state
    const [verticals, setVerticals] = useState<Vertical[]>([]);
    const [, startTransition] = useTransition();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [brandRes, verticalsRes] = await Promise.all([
            getBrand(brandId),
            getVerticals()
        ]);

        if (brandRes.data) {
            setBrand(brandRes.data);
            setBrandName(brandRes.data.name);
            setBrandDesc(brandRes.data.description || "");
            setLogoUrl(brandRes.data.logo_url || "");
            setSelectedVerticals(brandRes.data.verticals || []);
        }
        if (verticalsRes.data) {
            setVerticals(verticalsRes.data as Vertical[]);
        }
        setIsLoading(false);
    }, [brandId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Emit brand name to layout for breadcrumbs
    useEffect(() => {
        if (brand?.name) {
            window.dispatchEvent(new CustomEvent("brand-name", { detail: brand.name }));
        }
    }, [brand?.name]);

    const refreshVerticals = () => {
        startTransition(async () => {
            const res = await getVerticals();
            if (res.data) setVerticals(res.data as Vertical[]);
        });
    };

    const handleUpdateSettings = async () => {
        setIsSaving(true);
        const { error } = await updateBrand(brandId, {
            name: brandName,
            description: brandDesc,
            logo_url: logoUrl || null,
            verticals: selectedVerticals,
        });

        if (error) {
            toast.error(error);
        } else {
            toast.success("Settings updated");
            setBrand({ ...brand, name: brandName, description: brandDesc, logo_url: logoUrl, verticals: selectedVerticals });
        }
        setIsSaving(false);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const { url, error } = await uploadPageImage(brandId, base64);
            if (error) {
                toast.error(error);
            } else if (url) {
                setLogoUrl(url);
                toast.success("Logo uploaded!");
            }
            setIsUploadingLogo(false);
        };
        reader.readAsDataURL(file);
    };

    const toggleVertical = (verticalName: string) => {
        setSelectedVerticals(prev =>
            prev.includes(verticalName)
                ? prev.filter(v => v !== verticalName)
                : [...prev, verticalName]
        );
    };

    return (
        <DashboardPage>
            <div className="max-w-[70%] mx-auto w-full px-4 md:px-6 lg:px-10">
                {/* Back link */}
                <Link
                    href="/dashboard/brands"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Brands
                </Link>

                {isLoading ? (
                    <div className="space-y-5 max-w-2xl">
                        <div className="h-20 w-20 rounded-2xl bg-secondary/30 animate-pulse" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-11 rounded-xl bg-secondary/30 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-2xl space-y-6 w-full">
                        {/* Logo */}
                        <div className="flex items-start gap-4">
                            <div className="relative shrink-0 group">
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={isUploadingLogo}
                                    className={cn(
                                        "w-20 h-20 rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-secondary/20 transition-all cursor-pointer hover:border-primary/40",
                                        logoUrl ? "border-border/50" : "border-dashed border-border/60"
                                    )}
                                >
                                    {isUploadingLogo ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    ) : logoUrl ? (
                                        <img src={logoUrl} alt="Brand logo" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <Upload className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                    )}
                                </button>
                                {logoUrl && (
                                    <button
                                        onClick={() => setLogoUrl('')}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background border border-border/50 rounded-full flex items-center justify-center shadow-sm text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div className="pt-1 min-w-0">
                                <h1 className={cn("text-xl font-bold tracking-tight text-foreground", sansFont)}>
                                    {brand?.name || "Brand"}
                                </h1>
                                {selectedVerticals.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {selectedVerticals.map(v => (
                                            <span key={v} className="text-[11px] font-medium text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-full">{v}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Name</label>
                                <input
                                    type="text"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                    className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Brand name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Description</label>
                                <textarea
                                    value={brandDesc}
                                    onChange={(e) => setBrandDesc(e.target.value)}
                                    rows={2}
                                    className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    placeholder="Short description"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Verticals</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setVerticalDropdownOpen(!verticalDropdownOpen)}
                                        className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left flex items-center justify-between"
                                    >
                                        <span className={selectedVerticals.length === 0 ? "text-muted-foreground" : "text-foreground"}>
                                            {selectedVerticals.length === 0
                                                ? "Select verticals..."
                                                : selectedVerticals.join(", ")}
                                        </span>
                                        <ChevronUpDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                    </button>

                                    {verticalDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setVerticalDropdownOpen(false)} />
                                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-border/50 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                                                {verticals.length === 0 ? (
                                                    <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                                        No verticals available.
                                                        <AddVerticalModal
                                                            trigger={
                                                                <button className="block mx-auto mt-2 text-primary text-xs font-semibold hover:underline">
                                                                    Create one
                                                                </button>
                                                            }
                                                            onCreated={refreshVerticals}
                                                        />
                                                    </div>
                                                ) : (
                                                    verticals.map((v) => {
                                                        const isSelected = selectedVerticals.includes(v.name);
                                                        return (
                                                            <button
                                                                key={v.id}
                                                                type="button"
                                                                onClick={() => toggleVertical(v.name)}
                                                                className={cn(
                                                                    "w-full px-4 py-2.5 text-sm font-medium text-left flex items-center gap-2.5 transition-colors",
                                                                    isSelected
                                                                        ? "bg-primary/5 text-foreground"
                                                                        : "text-foreground hover:bg-secondary/50"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                                                    isSelected
                                                                        ? "bg-primary border-primary"
                                                                        : "border-border/60"
                                                                )}>
                                                                    {isSelected && <CheckIcon className="w-3 h-3 text-primary-foreground" />}
                                                                </div>
                                                                {v.name}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpdateSettings}
                            disabled={isSaving}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-2"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>
        </DashboardPage>
    );
}
