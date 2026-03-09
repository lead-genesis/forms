"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { DocumentTextIcon, PlusIcon, Cog6ToothIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getBrandPages, createPage, setPageAsIndex, BrandPage } from "@/app/actions/pages";
import { getBrand, updateBrand, verifyDomainDNS } from "@/app/actions/brands";
import { getBlogs } from "@/app/actions/blogs";
import { toast } from "sonner";
import Link from "next/link";
import { Edit2, Save, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
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

type Tab = 'pages' | 'blogs' | 'settings';

export default function BrandDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params.id as string;

    const [activeTab, setActiveTab] = useState<Tab>('pages');
    const [pages, setPages] = useState<BrandPage[]>([]);
    const [blogs, setBlogs] = useState<Array<{
        id: string;
        title: string;
        excerpt?: string | null;
        content: any;
        featured_image?: string | null;
        brand_id: string;
        brands?: { name: string };
    }>>([]);
    const [brand, setBrand] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Settings state
    const [brandName, setBrandName] = useState("");
    const [brandDesc, setBrandDesc] = useState("");
    const [customDomain, setCustomDomain] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [isSaving, setIsSaving] = useState(false);
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
            setCustomDomain(brandRes.data.custom_domain || "");
            setSubdomain(brandRes.data.subdomain || "");
        }
        if (pagesRes.data) {
            setPages(pagesRes.data);
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
        const title = type === 'landing' ? 'New Landing Page' : type === 'blog' ? 'New Blog Post' : 'New Page';
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
            custom_domain: customDomain || null,
            subdomain: subdomain || null
        });

        if (error) {
            toast.error(error);
        } else {
            toast.success("Settings updated");
            setBrand({ ...brand, name: brandName, description: brandDesc, custom_domain: customDomain, subdomain: subdomain });
            // Reset DNS status when domain changes
            setDnsStatus(null);
        }
        setIsSaving(false);
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

    const isConnected = dnsStatus ? (customDomain.toLowerCase().startsWith('www.') ? dnsStatus.cname : dnsStatus.a) : false;
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

    const filteredPages = pages.filter(p => p.type === 'landing' || p.type === 'content' || p.type === 'blog');
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
            <DashboardHeader
                title={brand ? brand.name : "Brand Details"}
                subtitle={brand ? brand.description || "Manage your brand pages and settings." : "Manage your brand pages and settings."}
            >
                <div className="flex items-center gap-3">
                    {activeTab !== 'settings' && mounted && (
                        activeTab === 'blogs' ? (
                            <Link
                                href={`/dashboard/blogs/new?brand_id=${brandId}`}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200 flex items-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Create Blog
                            </Link>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        disabled={isCreating}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200 flex items-center gap-2"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Create Page
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
            </DashboardHeader>

            <div className="px-4 md:px-6 lg:px-10">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-2xl w-fit mb-8 border border-border/50">
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'pages' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        Pages
                    </button>
                    <button
                        onClick={() => setActiveTab('blogs')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'blogs' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <NewspaperIcon className="w-4 h-4" />
                        Blogs
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === 'settings' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Settings
                    </button>
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
                    ) : activeTab === 'settings' ? (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl space-y-6"
                        >
                            <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                <CardContent className="p-8 space-y-6">
                                    <h4 className="text-lg font-bold mb-4">General Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
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
                                        <h4 className="text-lg font-bold mb-4">Domain & Subdomain</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                        {customDomain && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-6 p-5 bg-primary/5 rounded-2xl border border-primary/10"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h5 className="text-sm font-bold text-primary mb-1">DNS Setup Instructions</h5>
                                                        <p className="text-[10px] text-muted-foreground">Setup both for a seamless experience. <b>Verification will pass if at least one is correctly pointed.</b></p>
                                                    </div>
                                                    <button
                                                        onClick={handleVerifyDNS}
                                                        disabled={isVerifying}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                                                    >
                                                        {isVerifying ? (
                                                            <RefreshCcw className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        )}
                                                        Verify Configuration
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* A Record Card */}
                                                    <div className={cn(
                                                        "flex flex-col gap-1.5 p-3 rounded-xl border relative overflow-hidden transition-all bg-background/80 border-primary/20 ring-1 ring-primary/10"
                                                    )}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Type</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-foreground">A Record</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Host</span>
                                                            <span className="text-[10px] font-bold text-foreground">@</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Expected Value</span>
                                                            <code className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded">76.76.21.21</code>
                                                        </div>
                                                        {dnsStatus && (
                                                            <>
                                                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/20">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Detected</span>
                                                                    <code className={cn(
                                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded",
                                                                        dnsStatus.a ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                                                    )}>
                                                                        {dnsStatus.detectedA?.[0] || "None found"}
                                                                    </code>
                                                                </div>
                                                                <div className={cn(
                                                                    "absolute inset-y-0 right-0 w-1 flex items-center justify-center transition-all",
                                                                    dnsStatus.a ? "bg-emerald-500" : dnsStatus.detectedA?.length ? "bg-amber-500" : "bg-red-500"
                                                                )} />
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* CNAME Card */}
                                                    <div className={cn(
                                                        "flex flex-col gap-1.5 p-3 rounded-xl border relative overflow-hidden transition-all bg-background/80 border-primary/20 ring-1 ring-primary/10"
                                                    )}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Type</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-foreground">CNAME</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Host</span>
                                                            <span className="text-[10px] font-bold text-foreground">www</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Expected Value</span>
                                                            <code className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded">cname.genesisflow.io</code>
                                                        </div>
                                                        {dnsStatus && (
                                                            <>
                                                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/20">
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Detected</span>
                                                                    <code className={cn(
                                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded",
                                                                        dnsStatus.cname ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                                                                    )}>
                                                                        {dnsStatus.detectedCname?.[0] || "None found"}
                                                                    </code>
                                                                </div>
                                                                <div className={cn(
                                                                    "absolute inset-y-0 right-0 w-1 flex items-center justify-center transition-all",
                                                                    dnsStatus.cname ? "bg-emerald-500" : dnsStatus.detectedCname?.length ? "bg-amber-500" : "bg-red-500"
                                                                )} />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {dnsStatus?.vercel && (
                                                    <div className="mt-4">
                                                        <div className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border",
                                                            dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                ? "bg-emerald-500/5 border-emerald-500/10"
                                                                : dnsStatus.vercel.misconfigured
                                                                    ? "bg-red-500/5 border-red-500/10"
                                                                    : "bg-amber-500/5 border-amber-500/10"
                                                        )}>
                                                            {dnsStatus.vercel.verified && dnsStatus.vercel.configured ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            ) : (
                                                                <AlertCircle className={cn(
                                                                    "w-4 h-4 shrink-0",
                                                                    dnsStatus.vercel.misconfigured ? "text-red-500" : "text-amber-500"
                                                                )} />
                                                            )}
                                                            <div>
                                                                <p className={cn(
                                                                    "text-[10px] font-bold",
                                                                    dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                        ? "text-emerald-600"
                                                                        : dnsStatus.vercel.misconfigured
                                                                            ? "text-red-600"
                                                                            : "text-amber-600"
                                                                )}>
                                                                    {dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                        ? "Domain Active — SSL provisioned"
                                                                        : dnsStatus.vercel.misconfigured
                                                                            ? "Domain Misconfigured"
                                                                            : !dnsStatus.vercel.verified
                                                                                ? "Domain Verification Pending"
                                                                                : "Provisioning SSL Certificate..."}
                                                                </p>
                                                                <p className={cn(
                                                                    "text-[9px]",
                                                                    dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                        ? "text-emerald-600/80"
                                                                        : dnsStatus.vercel.misconfigured
                                                                            ? "text-red-600/80"
                                                                            : "text-amber-600/80"
                                                                )}>
                                                                    {dnsStatus.vercel.verified && dnsStatus.vercel.configured
                                                                        ? "Your domain is live and serving traffic with HTTPS."
                                                                        : dnsStatus.vercel.misconfigured
                                                                            ? "DNS records point elsewhere. Double-check your A/CNAME records above."
                                                                            : !dnsStatus.vercel.verified
                                                                                ? "Check the errors below for verification steps."
                                                                                : "SSL is being provisioned. This usually takes a few minutes."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="mt-4 text-[9px] text-muted-foreground bg-secondary/20 p-2 rounded-lg italic">
                                                    Note: For the best experience, we recommend setting up both the <b>apex domain</b> ({customDomain.replace('www.', '')}) and the <b>www subdomain</b>. Browsers will automatically redirect users to your brand's primary site regardless of which one they use.
                                                </p>

                                                {dnsStatus && dnsStatus.errors && dnsStatus.errors.length > 0 && (
                                                    <div className="mt-4 p-3 bg-red-500/5 rounded-xl border border-red-500/10 flex gap-3 items-start">
                                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-red-600">Verification Issues</p>
                                                            <ul className="text-[9px] text-red-500/80 list-disc list-inside">
                                                                {dnsStatus.errors.map((err, i) => (
                                                                    <li key={i}>{err}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}

                                                {dnsStatus && isConnected && (
                                                    <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex gap-3 items-start">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-emerald-600">Connected</p>
                                                            <p className="text-[9px] text-emerald-600/80">Your domain is correctly pointed to our servers.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {dnsStatus && isPartial && (
                                                    <div className="mt-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-3 items-start">
                                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-amber-600">Partial Configuration</p>
                                                            <p className="text-[9px] text-amber-600/80">We detected some records, but the primary setup for {customDomain} is not yet correct.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {dnsStatus && !isConnected && !isPartial && (
                                                    <div className="mt-4 p-3 bg-red-500/5 rounded-xl border border-red-500/10 flex gap-3 items-start">
                                                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-red-600">Not Detected</p>
                                                            <p className="text-[9px] text-red-600/80">We couldn't find the required DNS records for your domain yet.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
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
                                <div className="max-w-xl mx-auto py-12">
                                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
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
                                                href={`/dashboard/blogs/new?brand_id=${brandId}`}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
                                            >
                                                Create First Blog
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-border/50 bg-secondary/20">
                                                    <th className="px-4 py-3 font-semibold text-foreground">Headline</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Sub headline</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Blog content</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Image</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Brand</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground w-20" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {blogs.map((blog) => (
                                                    <tr
                                                        key={blog.id}
                                                        className="border-b border-border/30 hover:bg-secondary/10 transition-colors cursor-pointer"
                                                        onClick={() => router.push(`/dashboard/blogs/${blog.id}`)}
                                                    >
                                                        <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                                                            {blog.title || "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">
                                                            {blog.excerpt || "—"}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground max-w-[220px]">
                                                            <span className="line-clamp-2">{contentPreview(blog.content)}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {blog.featured_image ? (
                                                                <img
                                                                    src={blog.featured_image}
                                                                    alt=""
                                                                    className="w-12 h-12 rounded-lg object-cover border border-border/50"
                                                                />
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {blog.brands?.name ?? "—"}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Link
                                                                href={`/dashboard/blogs/${blog.id}`}
                                                                className="p-2 hover:bg-secondary/30 rounded-xl text-muted-foreground hover:text-foreground transition-all inline-flex"
                                                                title="Edit blog"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
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
                                <div className="max-w-xl mx-auto py-12">
                                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
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
                                <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-border/50 bg-secondary/20">
                                                    <th className="px-4 py-3 font-semibold text-foreground">Page</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Slug</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Index</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Type</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground hidden sm:table-cell">Updated</th>
                                                    <th className="px-4 py-3 font-semibold text-foreground w-20" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedPages.map((page) => (
                                                    <tr
                                                        key={page.id}
                                                        className="border-b border-border/30 hover:bg-secondary/10 transition-colors cursor-pointer"
                                                        onClick={() => router.push(`/page-builder/${page.id}`)}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                                                                    page.type === "landing" ? "bg-blue-500/10 text-blue-600" :
                                                                    page.type === "blog" ? "bg-purple-500/10 text-purple-600" : "bg-secondary text-muted-foreground"
                                                                )}>
                                                                    {page.type === "blog" ? (
                                                                        <NewspaperIcon className="w-4 h-4" />
                                                                    ) : (
                                                                        <DocumentTextIcon className="w-4 h-4" />
                                                                    )}
                                                                </div>
                                                                <span className={cn("font-medium text-foreground truncate max-w-[200px] block", sansFont)}>
                                                                    {page.title}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                            /{page.slug}
                                                        </td>
                                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                            {page.is_index ? (
                                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-tight">
                                                                    Index
                                                                </span>
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
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-tight",
                                                                page.type === "landing" ? "bg-blue-500/10 text-blue-600" :
                                                                page.type === "blog" ? "bg-purple-500/10 text-purple-600" : "bg-secondary text-muted-foreground"
                                                            )}>
                                                                {page.type === "blog" ? "Blog" : page.type === "landing" ? "Landing" : "Content"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight",
                                                                page.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground"
                                                            )}>
                                                                {page.is_published ? "Published" : "Draft"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                                                            {new Date(page.updated_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Link
                                                                href={`/page-builder/${page.id}`}
                                                                className="p-2 hover:bg-secondary/30 rounded-xl text-muted-foreground hover:text-foreground transition-all inline-flex"
                                                                title="Edit page"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardPage>
    );
}
