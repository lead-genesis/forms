"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import {
    sansFont,
    tableBase,
    tableHead,
    tableHeadCell,
    tableRow,
    tableCell,
} from "@/lib/design-system";
import { DocumentTextIcon, PlusIcon, Cog6ToothIcon, NewspaperIcon, GlobeAltIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getBrandPages, createPage, setPageAsIndex, migrateBrandBlogPages, BrandPage } from "@/app/actions/pages";
import { getBrand, updateBrand, updateBrandHeaderConfig, verifyDomainDNS } from "@/app/actions/brands";
import { getBlogs, updateBlog, deleteBlog } from "@/app/actions/blogs";
import { toast } from "sonner";
import Link from "next/link";
import { Edit2, Save, CheckCircle2, AlertCircle, RefreshCcw, Globe, ArrowRight, Upload, Loader2, X, Monitor, Tablet, Smartphone, ArrowLeft, ExternalLink, Check, GripVertical } from "lucide-react";
import { PageStatusToggle } from "@/components/PageStatusToggle";
import { Switch } from "@/components/ui/switch";
import { uploadPageImage } from "@/app/actions/pages";
import { HeaderRenderer } from "@/components/page-builder/renderers/HeaderRenderer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

type Tab = 'pages' | 'blogs' | 'header' | 'domain' | 'settings';

export default function BrandDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const searchParams = useSearchParams();
    const activeTab = (searchParams.get('tab') as Tab) || 'pages';

    const handleTabChange = (tab: Tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    const [pages, setPages] = useState<BrandPage[]>([]);
    const [blogs, setBlogs] = useState<Array<{
        id: string;
        title: string;
        excerpt?: string | null;
        content: any;
        featured_image?: string | null;
        brand_id: string;
        is_published?: boolean;
        brands?: { name: string };
    }>>([]);
    const [brand, setBrand] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Settings state
    const [brandName, setBrandName] = useState("");
    const [brandDesc, setBrandDesc] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [customDomain, setCustomDomain] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [ogImageUrl, setOgImageUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingDomain, setIsSavingDomain] = useState(false);

    // Header config state
    const [headerLogoUrl, setHeaderLogoUrl] = useState("");
    const [headerLogoHeight, setHeaderLogoHeight] = useState(32);
    const [headerNavigation, setHeaderNavigation] = useState<string[]>([]);
    const [headerNavFontSize, setHeaderNavFontSize] = useState(13);
    const [isSavingHeader, setIsSavingHeader] = useState(false);
    const [isUploadingHeaderLogo, setIsUploadingHeaderLogo] = useState(false);
    const headerLogoInputRef = useRef<HTMLInputElement>(null);
    const [headerPreviewViewport, setHeaderPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isVerifying, setIsVerifying] = useState(false);
    const [dnsStatus, setDnsStatus] = useState<{
        a: boolean;
        cname: boolean;
        detectedA: string[];
        detectedCname: string[];
        errors: string[];
        vercel?: {
            configured: boolean;
            misconfigured: boolean;
            verified: boolean;
        } | null;
    } | null>(null);
    const [settingIndexPageId, setSettingIndexPageId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [brandRes, pagesRes, blogsRes] = await Promise.all([
            getBrand(brandId),
            getBrandPages(brandId),
            getBlogs(brandId)
        ]);

        if (brandRes.data) {
            setBrand(brandRes.data);
            setBrandName(brandRes.data.name);
            setBrandDesc(brandRes.data.description || "");
            setLogoUrl(brandRes.data.logo_url || "");
            setCustomDomain(brandRes.data.custom_domain || "");
            setSubdomain(brandRes.data.subdomain || "");
            setSeoTitle(brandRes.data.seo_title || "");
            setSeoDescription(brandRes.data.seo_description || "");
            setOgImageUrl(brandRes.data.og_image_url || brandRes.data.logo_url || "");
            const hc = brandRes.data.header_config || {};
            setHeaderLogoUrl(hc.customLogoUrl || "");
            setHeaderLogoHeight(hc.logoHeight || 32);
            setHeaderNavigation(hc.navigation || []);
            setHeaderNavFontSize(hc.navFontSize || 13);
        }
        if (pagesRes.data) {
            const hasBlogList = pagesRes.data.some((p: BrandPage) => p.type === 'blog_list');
            const hasBlogTemplate = pagesRes.data.some((p: BrandPage) => p.type === 'blog');
            if (!hasBlogList || !hasBlogTemplate) {
                await migrateBrandBlogPages(brandId);
                const { data: refreshed } = await getBrandPages(brandId);
                setPages(refreshed || []);
            } else {
                setPages(pagesRes.data);
            }
        }
        if (blogsRes.data) {
            setBlogs(blogsRes.data);
        }
        setIsLoading(false);
    }, [brandId]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setMounted(true); }, []);

    const handleCreatePage = async (type: BrandPage['type'] = 'landing') => {
        setIsCreating(true);
        const title = type === 'landing' ? 'New Landing Page' : type === 'blog' ? 'New Blog Post' : type === 'blog_list' ? 'Blog List' : 'New Page';
        const { data, error } = await createPage(brandId, title, type);

        if (error) {
            toast.error(error);
            setIsCreating(false);
        } else if (data) {
            toast.success("Page created!");
            router.push(`/page-builder/${data.id}`);
        }
    };

    const handleUpdateSettings = async () => {
        setIsSaving(true);
        const { error } = await updateBrand(brandId, {
            name: brandName,
            description: brandDesc,
            logo_url: logoUrl || null,
            seo_title: seoTitle || null,
            seo_description: seoDescription || null,
            og_image_url: ogImageUrl || null,
        });

        if (error) {
            toast.error(error);
        } else {
            toast.success("Settings updated");
            setBrand({ ...brand, name: brandName, description: brandDesc, logo_url: logoUrl, seo_title: seoTitle, seo_description: seoDescription, og_image_url: ogImageUrl });
        }
        setIsSaving(false);
    };

    const handleUpdateDomain = async () => {
        setIsSavingDomain(true);
        const { error, vercelRegistered, vercelSkipped } = await updateBrand(brandId, {
            custom_domain: customDomain || null,
            subdomain: subdomain || null,
        });

        if (error) {
            toast.error(error);
        } else {
            toast.success("Domain settings updated");
            if (vercelRegistered) {
                toast.success("Both apex and www domains registered with Vercel.");
            }
            if (vercelSkipped) {
                toast.warning(
                    "Domain saved here but not added to Vercel. Add VERCEL_API_TOKEN and VERCEL_PROJECT_ID to your environment variables to register it in the Vercel dashboard."
                );
            }
            setBrand({ ...brand, custom_domain: customDomain, subdomain: subdomain });
            setDnsStatus(null);
        }
        setIsSavingDomain(false);
    };

    const handleSaveHeaderConfig = async () => {
        setIsSavingHeader(true);
        const headerConfig = {
            customLogoUrl: headerLogoUrl || null,
            logoHeight: headerLogoHeight,
            navigation: headerNavigation,
            navFontSize: headerNavFontSize,
        };
        const { error } = await updateBrandHeaderConfig(brandId, headerConfig);
        if (error) {
            toast.error(error);
        } else {
            toast.success("Header configuration saved");
            setBrand({ ...brand, header_config: headerConfig });
        }
        setIsSavingHeader(false);
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

    const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingHeaderLogo(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const { url, error } = await uploadPageImage(brandId, base64);
            if (error) {
                toast.error(error);
            } else if (url) {
                setHeaderLogoUrl(url);
                toast.success("Logo uploaded!");
            }
            setIsUploadingHeaderLogo(false);
        };
        reader.readAsDataURL(file);
    };

    const toggleHeaderNavPage = (pageId: string) => {
        setHeaderNavigation(prev =>
            prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]
        );
    };

    const handleVerifyDNS = async () => {
        if (!customDomain) return;
        setIsVerifying(true);
        const { data, error } = await verifyDomainDNS(customDomain);
        if (error) {
            toast.error(error);
        } else if (data) {
            setDnsStatus(data);
            const isWww = customDomain.toLowerCase().startsWith('www.');
            const isCorrect = isWww ? data.cname : data.a;

            if (isCorrect) {
                toast.success("Primary DNS record verified!");
            } else if (data.a || data.cname) {
                toast.warning("Partial configuration detected");
            } else {
                toast.error("DNS records not yet detected");
            }
        }
        setIsVerifying(false);
    };

    const domainPair = customDomain ? (() => {
        const clean = customDomain.toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
        const isWww = clean.startsWith("www.");
        const apex = isWww ? clean.slice(4) : clean;
        return { apex, www: `www.${apex}`, primary: clean, secondary: isWww ? apex : `www.${clean}` };
    })() : null;

    const isConnected = dnsStatus ? (dnsStatus.a && dnsStatus.cname) : false;
    const isPartial = dnsStatus && !isConnected && (dnsStatus.a || dnsStatus.cname);

    const handleSetAsIndex = async (pageId: string) => {
        setSettingIndexPageId(pageId);
        const { data, error } = await setPageAsIndex(pageId);
        setSettingIndexPageId(null);
        if (error) {
            toast.error(error);
        } else if (data) {
            toast.success("Index page updated. Only one page per brand can be the index (used for your domain).");
            fetchData();
        }
    };

    const filteredPages = pages.filter(p => p.type === 'landing' || p.type === 'content' || p.type === 'blog' || p.type === 'blog_list');
    const sortedPages = [...filteredPages].sort((a, b) => Number(b.is_index ?? 0) - Number(a.is_index ?? 0));

    /** Truncate rich text (JSON or string) to plain text for table preview. */
    const contentPreview = (content: any, maxLen = 60): string => {
        if (content == null) return "—";
        if (typeof content === "string") {
            const text = content.replace(/<[^>]+>/g, "").trim();
            return text.length > maxLen ? text.slice(0, maxLen) + "…" : text || "—";
        }
        if (typeof content === "object" && content.type === "doc" && Array.isArray(content.content)) {
            const text = content.content
                .map((n: any) => (n.content?.map((c: any) => c.text).join("") ?? ""))
                .join(" ")
                .trim();
            return text.length > maxLen ? text.slice(0, maxLen) + "…" : text || "—";
        }
        return "—";
    };

    return (
        <DashboardPage className="space-y-8">
            <div className="max-w-[70%] mx-auto w-full space-y-8">
            <div className="px-4 md:px-6 lg:px-10">
                <Link
                    href="/dashboard/brands"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Brands
                </Link>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 md:px-6 lg:px-10 mb-2">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {brand?.logo_url ? (
                        <img src={brand.logo_url} alt="" className="w-12 h-12 rounded-xl object-contain border border-border/50 bg-white shrink-0" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span className={cn("text-lg font-bold text-primary", sansFont)}>{brand?.name?.[0] || "B"}</span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className={cn("text-xl md:text-2xl font-bold tracking-tight text-foreground mb-0.5", sansFont)}>
                            {brand ? brand.name : "Brand Details"}
                        </h1>
                        <p className="text-muted-foreground/80 text-sm md:text-base max-w-2xl leading-relaxed">
                            {brand ? brand.description || "Manage your brand pages and settings." : "Manage your brand pages and settings."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 sm:mb-1">
                    {brand && (customDomain || subdomain) && (
                        <a
                            href={customDomain ? `https://${customDomain}` : `https://${subdomain}.genesisflow.io`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-border/50 hover:bg-secondary/50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm font-semibold transition-colors flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="hidden sm:inline">Visit Site</span>
                        </a>
                    )}
                    {activeTab !== 'settings' && activeTab !== 'domain' && activeTab !== 'header' && mounted && (
                        activeTab === 'blogs' ? (
                            <Link
                                href={`/dashboard/brands/${brandId}/blogs/new`}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200 flex items-center gap-1.5 sm:gap-2"
                            >
                                <PlusIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Create Blog</span>
                            </Link>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        disabled={isCreating}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200 flex items-center gap-1.5 sm:gap-2"
                                    >
                                        <PlusIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="hidden sm:inline">Create Page</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                    <DropdownMenuItem onClick={() => handleCreatePage('landing')} className="rounded-lg">
                                        Landing Page
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCreatePage('content')} className="rounded-lg">
                                        Content Page
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    )}
                </div>
            </div>

            <div className="px-3 sm:px-4 md:px-6 lg:px-10">
                {/* Tabs */}
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 pb-2 mb-6 md:mb-8 scrollbar-thin">
                    <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-2xl w-max min-w-0 border border-border/50 mx-3 sm:mx-4 md:mx-0">
                        <button
                            onClick={() => handleTabChange('pages')}
                            className={cn(
                                "px-3 sm:px-4 md:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0",
                                activeTab === 'pages' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <DocumentTextIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Pages
                        </button>
                        <button
                            onClick={() => handleTabChange('blogs')}
                            className={cn(
                                "px-3 sm:px-4 md:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0",
                                activeTab === 'blogs' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <NewspaperIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Blogs
                        </button>
                        <button
                            onClick={() => handleTabChange('header')}
                            className={cn(
                                "px-3 sm:px-4 md:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0",
                                activeTab === 'header' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Bars3Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Header
                        </button>
                        <button
                            onClick={() => handleTabChange('domain')}
                            className={cn(
                                "px-3 sm:px-4 md:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0",
                                activeTab === 'domain' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <GlobeAltIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Domain
                        </button>
                        <button
                            onClick={() => handleTabChange('settings')}
                            className={cn(
                                "px-3 sm:px-4 md:px-6 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0",
                                activeTab === 'settings' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Cog6ToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Settings
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-40 rounded-2xl bg-secondary/30 animate-pulse" />
                            ))}
                        </motion.div>
                    ) : activeTab === 'header' ? (
                        <motion.div
                            key="header"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch max-w-[1080px] w-full"
                        >
                            {/* Left: Settings */}
                            <div className="w-full lg:w-[420px] lg:shrink-0 space-y-6 min-w-0">
                                <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                    <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
                                        <div>
                                            <h4 className="text-lg font-bold mb-1">Site Header</h4>
                                            <p className="text-xs text-muted-foreground">Configure your header once — it applies across all pages for this brand.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground px-1">Header Logo</label>
                                                <div className="space-y-3">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <input
                                                            type="text"
                                                            value={headerLogoUrl}
                                                            onChange={(e) => setHeaderLogoUrl(e.target.value)}
                                                            placeholder="Paste logo URL..."
                                                            className={cn(
                                                                "flex-1 min-w-0 bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium",
                                                                headerLogoUrl && !headerLogoUrl.startsWith('http') && !headerLogoUrl.startsWith('/') && "border-red-200 bg-red-50/30"
                                                            )}
                                                        />
                                                        <input
                                                            type="file"
                                                            ref={headerLogoInputRef}
                                                            onChange={handleHeaderLogoUpload}
                                                            className="hidden"
                                                            accept="image/*"
                                                        />
                                                        <button
                                                            onClick={() => headerLogoInputRef.current?.click()}
                                                            disabled={isUploadingHeaderLogo}
                                                            className="px-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                        >
                                                            {isUploadingHeaderLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                        </button>
                                                    </div>

                                                    {headerLogoUrl && (
                                                        <div className="h-20 w-full rounded-xl border border-border/50 bg-secondary/10 overflow-hidden relative flex items-center justify-center p-4">
                                                            <img src={headerLogoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                                                            <button
                                                                onClick={() => setHeaderLogoUrl('')}
                                                                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline px-1">
                                                    <label className="text-sm font-semibold text-foreground">Logo Size</label>
                                                    <span className="text-xs font-mono text-muted-foreground">{headerLogoHeight}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="16"
                                                    max="80"
                                                    step="2"
                                                    value={headerLogoHeight}
                                                    onChange={(e) => setHeaderLogoHeight(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border/40 space-y-4">
                                            <div>
                                                <h4 className="text-lg font-bold mb-1">Navigation Links</h4>
                                                <p className="text-xs text-muted-foreground">Drag to reorder active links. The order here is reflected in the live header.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline px-1">
                                                    <label className="text-sm font-semibold text-foreground">Nav Font Size</label>
                                                    <span className="text-xs font-mono text-muted-foreground">{headerNavFontSize}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="24"
                                                    step="1"
                                                    value={headerNavFontSize}
                                                    onChange={(e) => setHeaderNavFontSize(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                            </div>

                                            {/* Active Navigation - Drag to Reorder */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-sm font-semibold text-foreground">Active Navigation</label>
                                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-medium">Drag to reorder</span>
                                                </div>
                                                <Reorder.Group
                                                    axis="y"
                                                    values={headerNavigation}
                                                    onReorder={setHeaderNavigation}
                                                    className="space-y-2"
                                                >
                                                    {headerNavigation.map((pageId: string) => {
                                                        const page = pages.find(p => p.id === pageId);
                                                        if (!page) return null;
                                                        return (
                                                            <Reorder.Item
                                                                key={pageId}
                                                                value={pageId}
                                                                className="bg-primary border border-primary text-primary-foreground rounded-xl p-3 flex items-center gap-3 shadow-sm group"
                                                            >
                                                                <GripVertical className="w-4 h-4 opacity-60 cursor-grab active:cursor-grabbing" />
                                                                <div className="flex-1 flex flex-col min-w-0">
                                                                    <span className="text-xs font-bold truncate">{page.title}</span>
                                                                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60 truncate">/{page.slug}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleHeaderNavPage(pageId)}
                                                                    className="p-1.5 opacity-60 hover:opacity-100 hover:bg-primary-foreground/10 rounded-lg transition-all"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </Reorder.Item>
                                                        );
                                                    })}
                                                    {headerNavigation.length === 0 && (
                                                        <div className="p-6 text-center border-2 border-dashed border-border/30 rounded-2xl">
                                                            <p className="text-xs text-muted-foreground italic">No links added to navigation yet.</p>
                                                        </div>
                                                    )}
                                                </Reorder.Group>
                                            </div>

                                            {/* Available Pages to Add */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground px-1">Add Pages</label>
                                                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                                                    {pages.filter(p => !headerNavigation.includes(p.id)).length > 0 ? (
                                                        pages.filter(p => !headerNavigation.includes(p.id)).map((page) => (
                                                            <button
                                                                key={page.id}
                                                                onClick={() => toggleHeaderNavPage(page.id)}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                                                                    !page.is_published
                                                                        ? "bg-secondary/30 border-border/30 text-muted-foreground/50 opacity-60"
                                                                        : "bg-background border-border/50 text-foreground hover:border-border"
                                                                )}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold">{page.title}</span>
                                                                        {!page.is_published && (
                                                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/60 uppercase tracking-wider">Draft</span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground opacity-60">
                                                                        /{page.slug}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : pages.length > 0 ? (
                                                        <div className="p-6 text-center border-2 border-dashed border-border/30 rounded-2xl">
                                                            <p className="text-xs text-muted-foreground italic">All pages are already in the navigation.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center border-2 border-dashed border-border/30 rounded-2xl">
                                                            <p className="text-xs text-muted-foreground italic">No pages found. Create pages first to add navigation links.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSaveHeaderConfig}
                                            disabled={isSavingHeader}
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSavingHeader ? "Saving..." : "Save Header"}
                                        </button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Live Preview */}
                            <div className="flex-1 min-w-0 flex flex-col w-full">
                                <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0">
                                    <div className="px-3 sm:px-5 py-3 sm:py-3.5 border-b border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-secondary/10">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Preview</span>
                                        <div className="flex items-center gap-1 bg-background border border-border/50 rounded-lg p-0.5 w-fit">
                                            {([
                                                { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
                                                { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                                                { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
                                            ]).map((vp) => (
                                                <button
                                                    key={vp.id}
                                                    onClick={() => setHeaderPreviewViewport(vp.id)}
                                                    className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        headerPreviewViewport === vp.id
                                                            ? "bg-foreground text-background shadow-sm"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                    title={vp.label}
                                                >
                                                    <vp.icon className="w-3.5 h-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50/50 flex justify-center p-3 sm:p-6 flex-1 min-h-[280px] sm:min-h-[320px] overflow-auto">
                                        <div
                                            className={cn(
                                                "bg-white rounded-2xl shadow-lg shadow-black/5 overflow-hidden transition-all duration-500 ease-out border border-zinc-200/60 relative shrink-0",
                                                headerPreviewViewport === 'desktop' && "w-full max-w-full",
                                                headerPreviewViewport === 'tablet' && "w-full max-w-[768px]",
                                                headerPreviewViewport === 'mobile' && "w-full max-w-[375px]"
                                            )}
                                        >
                                            {/* Faux browser chrome */}
                                            <div className="h-9 border-b border-zinc-100 flex items-center px-4 bg-white/80">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                                                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                                                    <div className="w-2 h-2 rounded-full bg-zinc-200" />
                                                </div>
                                                <div className="mx-auto bg-zinc-100/80 px-3 py-1 rounded-full">
                                                    <span className="text-[9px] font-medium text-zinc-400 tabular-nums lowercase tracking-tight">
                                                        {brand?.name?.toLowerCase().replace(/\s/g, '') || "brand"}.com
                                                    </span>
                                                </div>
                                            </div>

                                            <HeaderRenderer
                                                data={{
                                                    customLogoUrl: headerLogoUrl || null,
                                                    logoHeight: headerLogoHeight,
                                                    navigation: headerNavigation,
                                                    navFontSize: headerNavFontSize,
                                                }}
                                                brand={brand}
                                                brandPages={pages}
                                                forceMobile={headerPreviewViewport === 'mobile' || headerPreviewViewport === 'tablet'}
                                                contained
                                            />

                                            {/* Placeholder body */}
                                            <div className="p-6 space-y-3">
                                                <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
                                                <div className="h-3 bg-zinc-50 rounded-full w-full" />
                                                <div className="h-3 bg-zinc-50 rounded-full w-5/6" />
                                                <div className="h-3 bg-zinc-50 rounded-full w-2/3" />
                                            </div>
                                        </div>
                                    </div>

                                    {headerPreviewViewport !== 'desktop' && (
                                        <div className="px-5 py-3 border-t border-border/30 bg-secondary/5">
                                            <p className="text-[11px] text-muted-foreground text-center">
                                                Tap the <strong>menu icon</strong> in the preview to test the mobile slide-out navigation.
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </motion.div>
                    ) : activeTab === 'domain' ? (
                        <motion.div
                            key="domain"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl space-y-6 w-full min-w-0"
                        >
                            <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
                                    <h4 className="text-lg font-bold mb-4">Domain & Subdomain</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground px-1">Subdomain</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={subdomain}
                                                    onChange={(e) => setSubdomain(e.target.value)}
                                                    className="flex-1 bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                    placeholder="my-brand"
                                                />
                                                <span className="text-sm text-muted-foreground font-medium">.genesisflow.io</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground px-1">Your site will be accessible at this subdomain.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground px-1">Custom Domain</label>
                                            <input
                                                type="text"
                                                value={customDomain}
                                                onChange={(e) => setCustomDomain(e.target.value)}
                                                className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                placeholder="www.example.com"
                                            />
                                            <p className="text-[11px] text-muted-foreground px-1">Enter your own domain (e.g., example.com).</p>
                                        </div>
                                    </div>

                                    {customDomain && domainPair && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-6 space-y-4"
                                        >
                                            <div className="rounded-2xl border border-border/50 overflow-hidden min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-5 py-3 sm:py-3.5 bg-secondary/20 border-b border-border/50">
                                                    <div className="flex items-center gap-2.5">
                                                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                        <h5 className="text-sm font-bold text-foreground">Connected Domains</h5>
                                                    </div>
                                                    <button
                                                        onClick={handleVerifyDNS}
                                                        disabled={isVerifying}
                                                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all disabled:opacity-50 w-full sm:w-auto"
                                                    >
                                                        {isVerifying ? (
                                                            <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <RefreshCcw className="w-3.5 h-3.5" />
                                                        )}
                                                        {isVerifying ? "Checking..." : "Verify DNS"}
                                                    </button>
                                                </div>

                                                <p className="px-3 sm:px-5 pt-3 pb-1 text-xs text-muted-foreground">
                                                    Both domains are automatically registered with Vercel. The secondary domain redirects to your primary.
                                                </p>

                                                <div className="divide-y divide-border/30">
                                                    {/* Apex domain row */}
                                                    <div className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                                            <div className={cn(
                                                                "w-2.5 h-2.5 rounded-full shrink-0 transition-colors mt-0.5",
                                                                !dnsStatus ? "bg-muted-foreground/30" : dnsStatus.a ? "bg-emerald-500" : "bg-red-500"
                                                            )} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-sm font-semibold text-foreground truncate">{domainPair.apex}</span>
                                                                {domainPair.primary === domainPair.apex && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wide shrink-0">Primary</span>
                                                                )}
                                                                {domainPair.primary !== domainPair.apex && (
                                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase tracking-wide shrink-0 flex items-center gap-1">
                                                                        <ArrowRight className="w-2.5 h-2.5" />Redirect
                                                                    </span>
                                                                )}
                                                            </div>
                                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                                    <span className="text-xs text-muted-foreground">A Record</span>
                                                                    <span className="text-xs text-muted-foreground/40 hidden sm:inline">|</span>
                                                                    <code className="text-xs font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded break-all">@ → 216.198.79.1</code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 sm:text-right pl-5 sm:pl-0">
                                                            {!dnsStatus ? (
                                                                <span className="text-xs text-muted-foreground">Not checked</span>
                                                            ) : dnsStatus.a ? (
                                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />Connected
                                                                </span>
                                                            ) : (
                                                                <div>
                                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                                                                        <AlertCircle className="w-3.5 h-3.5" />Not detected
                                                                    </span>
                                                                    {dnsStatus.detectedA?.length > 0 && (
                                                                        <p className="text-[10px] text-red-400 mt-0.5">Found: {dnsStatus.detectedA[0]}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* WWW domain row */}
                                                    <div className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                                            <div className={cn(
                                                                "w-2.5 h-2.5 rounded-full shrink-0 transition-colors mt-0.5",
                                                                !dnsStatus ? "bg-muted-foreground/30" : dnsStatus.cname ? "bg-emerald-500" : "bg-red-500"
                                                            )} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-sm font-semibold text-foreground truncate">{domainPair.www}</span>
                                                                {domainPair.primary === domainPair.www && (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wide shrink-0">Primary</span>
                                                                )}
                                                                {domainPair.primary !== domainPair.www && (
                                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase tracking-wide shrink-0 flex items-center gap-1">
                                                                        <ArrowRight className="w-2.5 h-2.5" />Redirect
                                                                    </span>
                                                                )}
                                                            </div>
                                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                                    <span className="text-xs text-muted-foreground">A Record</span>
                                                                    <span className="text-xs text-muted-foreground/40 hidden sm:inline">|</span>
                                                                    <code className="text-xs font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded break-all">www → 216.198.79.1</code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 sm:text-right pl-5 sm:pl-0">
                                                            {!dnsStatus ? (
                                                                <span className="text-xs text-muted-foreground">Not checked</span>
                                                            ) : dnsStatus.cname ? (
                                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />Connected
                                                                </span>
                                                            ) : (
                                                                <div>
                                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                                                                        <AlertCircle className="w-3.5 h-3.5" />Not detected
                                                                    </span>
                                                                    {dnsStatus.detectedCname?.length > 0 && (
                                                                        <p className="text-[10px] text-red-400 mt-0.5">Found: {dnsStatus.detectedCname[0]}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Subdomain row */}
                                                    {subdomain && (
                                                        <div className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                            <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-foreground truncate">{subdomain}.genesisflow.io</span>
                                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase tracking-wide shrink-0">Subdomain</span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">Managed automatically — no DNS setup needed</p>
                                                            </div>
                                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 shrink-0">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />Active
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Vercel SSL / Platform Status */}
                                            {dnsStatus?.vercel && (
                                                <div className={cn(
                                                    "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5 px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl border",
                                                    dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                                        : dnsStatus.vercel.misconfigured
                                                            ? "bg-red-500/5 border-red-500/20"
                                                            : "bg-amber-500/5 border-amber-500/20"
                                                )}>
                                                    {dnsStatus.vercel.verified && dnsStatus.vercel.configured ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <AlertCircle className={cn(
                                                            "w-5 h-5 shrink-0",
                                                            dnsStatus.vercel.misconfigured ? "text-red-500" : "text-amber-500"
                                                        )} />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "text-sm font-semibold",
                                                            dnsStatus.vercel.verified && dnsStatus.vercel.configured ? "text-emerald-600"
                                                                : dnsStatus.vercel.misconfigured ? "text-red-600" : "text-amber-600"
                                                        )}>
                                                            {dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                ? "SSL Active — Serving HTTPS traffic"
                                                                : dnsStatus.vercel.misconfigured
                                                                    ? "Misconfigured — Check DNS records"
                                                                    : !dnsStatus.vercel.verified
                                                                        ? "Verification Pending"
                                                                        : "Provisioning SSL..."}
                                                        </p>
                                                        <p className={cn(
                                                            "text-xs mt-0.5",
                                                            dnsStatus.vercel.verified && dnsStatus.vercel.configured ? "text-emerald-600/70"
                                                                : dnsStatus.vercel.misconfigured ? "text-red-600/70" : "text-amber-600/70"
                                                        )}>
                                                            {dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                ? "Both domains are live with automatic HTTPS."
                                                                : dnsStatus.vercel.misconfigured
                                                                    ? "DNS records are pointing elsewhere. Update your A records for both apex and www."
                                                                    : !dnsStatus.vercel.verified
                                                                        ? "Waiting for domain ownership verification. See issues below."
                                                                        : "SSL certificates are being provisioned. This typically takes 1-2 minutes."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {dnsStatus && isConnected && !dnsStatus.vercel && (
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5 px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-emerald-600">All DNS Records Connected</p>
                                                        <p className="text-xs text-emerald-600/70 mt-0.5">Both apex and www are correctly pointed to our servers.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {dnsStatus && isPartial && (
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5 px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl border bg-amber-500/5 border-amber-500/20">
                                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-600">Partial Configuration</p>
                                                        <p className="text-xs text-amber-600/70 mt-0.5">
                                                            {dnsStatus.a && !dnsStatus.cname
                                                                ? `Apex domain is connected but www.${domainPair.apex} needs an A record pointing to 216.198.79.1.`
                                                                : `www is connected but ${domainPair.apex} needs an A record pointing to 216.198.79.1.`}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {dnsStatus && !isConnected && !isPartial && (
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5 px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl border bg-red-500/5 border-red-500/20">
                                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-red-600">DNS Records Not Detected</p>
                                                        <p className="text-xs text-red-600/70 mt-0.5">Add the DNS records shown above in your domain registrar, then click Verify DNS.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {dnsStatus?.errors && dnsStatus.errors.length > 0 && (
                                                <div className="px-3 sm:px-5 py-3 sm:py-3.5 rounded-2xl border bg-red-500/5 border-red-500/20 flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-start">
                                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                                    <div className="space-y-1.5">
                                                        <p className="text-sm font-semibold text-red-600">Issues Found</p>
                                                        <ul className="text-xs text-red-500/80 space-y-1 list-disc list-inside">
                                                            {dnsStatus.errors.map((err, i) => (
                                                                <li key={i}>{err}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {!dnsStatus && (
                                                <div className="px-3 sm:px-5 py-3 sm:py-4 rounded-2xl bg-secondary/10 border border-border/30">
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        Add these DNS records at your domain registrar, then click <b>Verify DNS</b> above.
                                                        Both the apex (<code className="text-[11px] font-mono bg-secondary/50 px-1 py-0.5 rounded">{domainPair.apex}</code>) and www
                                                        (<code className="text-[11px] font-mono bg-secondary/50 px-1 py-0.5 rounded">{domainPair.www}</code>) will be registered
                                                        with Vercel. The secondary domain automatically redirects to your primary.
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={handleUpdateDomain}
                                        disabled={isSavingDomain}
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSavingDomain ? "Saving..." : "Save Domain Settings"}
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : activeTab === 'settings' ? (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl space-y-6 w-full min-w-0"
                        >
                            <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
                                    <h4 className="text-lg font-bold mb-4">General Settings</h4>

                                    {/* Brand Logo */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground px-1">Brand Logo</label>
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                            <div className="relative shrink-0">
                                                <div className={cn(
                                                    "w-20 h-20 rounded-2xl border-2 overflow-hidden flex items-center justify-center bg-secondary/20 transition-all",
                                                    logoUrl ? "border-border/50" : "border-dashed border-border/60"
                                                )}>
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt="Brand logo" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Upload className="w-6 h-6 text-muted-foreground/40" />
                                                    )}
                                                </div>
                                                {logoUrl && (
                                                    <button
                                                        onClick={() => setLogoUrl('')}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background border border-border/50 rounded-full flex items-center justify-center shadow-sm text-muted-foreground hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2 min-w-0 w-full">
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <input
                                                        type="text"
                                                        value={logoUrl}
                                                        onChange={(e) => setLogoUrl(e.target.value)}
                                                        placeholder="Paste logo URL..."
                                                        className="flex-1 min-w-0 bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                    />
                                                    <input
                                                        type="file"
                                                        ref={logoInputRef}
                                                        onChange={handleLogoUpload}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                    <button
                                                        onClick={() => logoInputRef.current?.click()}
                                                        disabled={isUploadingLogo}
                                                        className="px-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                                                    >
                                                        {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground px-1">Used on the brand card and as the default social preview image.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2 min-w-0">
                                            <label className="text-sm font-semibold text-foreground px-1">Brand Name</label>
                                            <input
                                                type="text"
                                                value={brandName}
                                                onChange={(e) => setBrandName(e.target.value)}
                                                className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                placeholder="Enter brand name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground px-1">Description</label>
                                            <textarea
                                                value={brandDesc}
                                                onChange={(e) => setBrandDesc(e.target.value)}
                                                rows={1}
                                                className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                                placeholder="Short description"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border/40">
                                        <h4 className="text-lg font-bold mb-1">SEO & Meta Data</h4>
                                        <p className="text-xs text-muted-foreground mb-4">Controls how your brand appears in search engines and social media previews.</p>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground px-1">SEO Title</label>
                                                <input
                                                    type="text"
                                                    value={seoTitle}
                                                    onChange={(e) => setSeoTitle(e.target.value)}
                                                    className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                    placeholder="Custom title for search engines"
                                                    maxLength={120}
                                                />
                                                <div className="flex items-center justify-between px-1">
                                                    <p className="text-[11px] text-muted-foreground">Overrides the brand name in search results and browser tabs.</p>
                                                    <span className={cn("text-[11px] font-medium", seoTitle.length > 60 ? "text-amber-500" : "text-muted-foreground")}>{seoTitle.length}/120</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground px-1">Meta Description</label>
                                                <textarea
                                                    value={seoDescription}
                                                    onChange={(e) => setSeoDescription(e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                                                    placeholder="Brief description shown in search engine results"
                                                    maxLength={320}
                                                />
                                                <div className="flex items-center justify-between px-1">
                                                    <p className="text-[11px] text-muted-foreground">Appears beneath the title in Google results. Aim for 50–160 characters.</p>
                                                    <span className={cn("text-[11px] font-medium", seoDescription.length > 160 ? "text-amber-500" : "text-muted-foreground")}>{seoDescription.length}/320</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground px-1">Open Graph Image URL</label>
                                                <input
                                                    type="url"
                                                    value={ogImageUrl}
                                                    onChange={(e) => setOgImageUrl(e.target.value)}
                                                    className="w-full bg-secondary/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                    placeholder="https://example.com/og-image.png"
                                                />
                                                <p className="text-[11px] text-muted-foreground px-1">Image shown when your site is shared on social media. Recommended: 1200x630px.</p>
                                                {ogImageUrl && (
                                                    <div className="mt-2 rounded-xl border border-border/50 overflow-hidden bg-secondary/10">
                                                        {ogImageUrl === brand?.logo_url && (
                                                            <div className="px-4 py-2 bg-secondary/30 border-b border-border/30 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                                <span className="text-[11px] font-medium text-muted-foreground">Using your brand logo as the default social preview image</span>
                                                            </div>
                                                        )}
                                                        <img
                                                            src={ogImageUrl}
                                                            alt="OG preview"
                                                            className="w-full max-h-48 object-contain bg-secondary/5 p-2"
                                                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateSettings}
                                        disabled={isSaving}
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? "Saving..." : "Save Settings"}
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : activeTab === 'blogs' ? (
                        <motion.div
                            key="blogs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {blogs.length === 0 ? (
                                <div className="max-w-xl mx-auto py-8 sm:py-12 px-3 sm:px-0">
                                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                                        <CardContent className="p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                                <NewspaperIcon className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>
                                                No blogs yet
                                            </h2>
                                            <p className="text-muted-foreground mb-6 max-w-md">
                                                Share updates and insights by creating your first blog post for this brand.
                                            </p>
                                            <Link
                                                href={`/dashboard/brands/${brandId}/blogs/new`}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                Create First Blog
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto">
                                    <table className={tableBase + " border-collapse min-w-[640px]"}>
                                        <thead className={tableHead}>
                                            <tr>
                                                <th className={tableHeadCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>Blog</th>
                                                <th className={tableHeadCell + " px-4"}>Status</th>
                                                <th className={tableHeadCell + " px-4 w-12"}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {blogs.map((blog) => (
                                                <tr
                                                    key={blog.id}
                                                    className={cn(tableRow, "group cursor-pointer active:bg-secondary/20")}
                                                    onClick={() => router.push(`/dashboard/brands/${brandId}/blogs/${blog.id}`)}
                                                >
                                                    <td className={tableCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                                                {blog.title?.[0] || 'B'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold truncate max-w-[160px] sm:max-w-[200px]">{blog.title || "—"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={tableCell + " px-4"} onClick={(e) => e.stopPropagation()}>
                                                        <Switch
                                                            checked={blog.is_published ?? false}
                                                            onCheckedChange={async (checked) => {
                                                                setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_published: checked } : b));
                                                                const res = await updateBlog(blog.id, { is_published: checked });
                                                                if (res.error) {
                                                                    toast.error("Failed to update blog status");
                                                                    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_published: !checked } : b));
                                                                } else {
                                                                    toast.success(`Blog ${checked ? "published" : "unpublished"}`);
                                                                }
                                                            }}
                                                            className="data-[state=checked]:bg-emerald-500"
                                                        />
                                                    </td>
                                                    <td className={tableCell + " px-4"} onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
                                                                const { error } = await deleteBlog(blog.id);
                                                                if (error) {
                                                                    toast.error("Failed to delete blog");
                                                                } else {
                                                                    setBlogs(prev => prev.filter(b => b.id !== blog.id));
                                                                    toast.success("Blog deleted");
                                                                }
                                                            }}
                                                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete blog"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pages"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {filteredPages.length === 0 ? (
                                <div className="max-w-xl mx-auto py-8 sm:py-12 px-3 sm:px-0">
                                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                                        <CardContent className="p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                                <DocumentTextIcon className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>
                                                No pages yet
                                            </h2>
                                            <p className="text-muted-foreground mb-6 max-w-md">
                                                Setup your brand&apos;s digital presence by creating your first page.
                                            </p>
                                            <button
                                                onClick={() => handleCreatePage('landing')}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                Create First Page
                                            </button>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto -mx-3 sm:mx-0 rounded-2xl min-w-0">
                                    <table className={tableBase + " border-collapse min-w-[520px] sm:min-w-full w-full"}>
                                        <thead className={tableHead}>
                                            <tr>
                                                <th className={tableHeadCell}>Page</th>
                                                <th className={tableHeadCell + " hidden sm:table-cell"}>Slug</th>
                                                <th className={tableHeadCell}>Index</th>
                                                <th className={tableHeadCell}>Status</th>
                                                <th className={tableHeadCell + " hidden lg:table-cell"}>Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedPages.map((page) => (
                                                    <tr
                                                        key={page.id}
                                                        className={cn(tableRow, "cursor-pointer transition-colors active:bg-secondary/20")}
                                                        onClick={() => router.push(`/page-builder/${page.id}`)}
                                                    >
                                                        <td className={tableCell}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                    page.type === "landing" ? "bg-blue-500/10 text-blue-600" :
                                                                    (page.type === "blog" || page.type === "blog_list") ? "bg-purple-500/10 text-purple-600" : "bg-secondary text-muted-foreground"
                                                                )}>
                                                                    {(page.type === "blog" || page.type === "blog_list") ? (
                                                                        <NewspaperIcon className="w-4 h-4" />
                                                                    ) : (
                                                                        <DocumentTextIcon className="w-4 h-4" />
                                                                    )}
                                                                </div>
                                                                <span className={cn("font-medium text-foreground truncate max-w-[140px] sm:max-w-[200px] block", sansFont)}>
                                                                    {page.title}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className={tableCell + " text-muted-foreground font-mono text-xs hidden sm:table-cell"}>
                                                            /{page.slug}
                                                        </td>
                                                        <td className={tableCell} onClick={(e) => e.stopPropagation()}>
                                                            {page.is_index ? (
                                                                <Check className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    disabled={settingIndexPageId !== null}
                                                                    onClick={() => handleSetAsIndex(page.id)}
                                                                    className="text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                                                >
                                                                    {settingIndexPageId === page.id ? "Updating…" : "Set as index"}
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className={tableCell} onClick={(e) => e.stopPropagation()}>
                                                            <PageStatusToggle page={page} showLabel={false} />
                                                        </td>
                                                        <td className={tableCell + " text-muted-foreground text-xs hidden lg:table-cell"}>
                                                            {new Date(page.updated_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            </div>
        </DashboardPage>
    );
}
