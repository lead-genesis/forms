"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    UserGroupIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ClipboardDocumentIcon,
    ClipboardDocumentListIcon,
    CheckIcon,
    LinkIcon,
} from "@heroicons/react/24/outline";
import { getFormWithBrand, getLeadsByForm, updateForm, getFormSteps, duplicateForm } from "@/app/actions/forms";
import { toast } from "sonner";

import { format } from "date-fns";
import { LeadDetailsSheet } from "@/components/leads/LeadDetailsSheet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Form {
    id: string;
    name: string;
    status: string;
    webhook_url: string | null;
    created_at: string;
    brand_id: string;
    subdomain: string | null;
    views: number;
    brands?: {
        id: string;
        name: string;
        logo_url?: string | null;
        banner_url?: string | null;
    };
}

interface Lead {
    id: string;
    created_at: string;
    form_id: string;
    answers: Record<string, any>;
    form_name?: string;
    webhook_status?: number | null;
    webhook_response?: any;
    is_sms_verified?: boolean;
}

interface FormStep {
    id: string;
    type: string;
    title: string;
    data: any;
    order: number;
}

type Tab = "leads" | "performance" | "settings";

const tabs: { key: Tab; label: string; icon: typeof UserGroupIcon }[] = [
    { key: "leads", label: "Leads", icon: UserGroupIcon },
    { key: "settings", label: "Settings", icon: Cog6ToothIcon },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const formId = params.id;

    const [form, setForm] = useState<Form | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [steps, setSteps] = useState<FormStep[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>("leads");
    const [isLoading, setIsLoading] = useState(true);

    // Lead Sheet State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Settings state
    const [editName, setEditName] = useState("");
    const [editWebhook, setEditWebhook] = useState("");
    const [editStatus, setEditStatus] = useState("draft");
    const [editSubdomain, setEditSubdomain] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [formRes, leadsRes, stepsRes] = await Promise.all([
            getFormWithBrand(formId),
            getLeadsByForm(formId),
            getFormSteps(formId),
        ]);
        const f = formRes.data as Form | null;
        setForm(f);
        setLeads(leadsRes.data as Lead[]);
        setSteps(stepsRes.data as FormStep[]);
        if (f) {
            setEditName(f.name);
            setEditWebhook(f.webhook_url ?? "");
            setEditStatus(f.status);
            setEditSubdomain(f.subdomain ?? "");
        }
        setIsLoading(false);
    }, [formId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveSettings = async () => {
        if (!form) return;
        setIsSaving(true);
        await updateForm(form.id, {
            name: editName.trim() || form.name,
            webhook_url: editWebhook.trim() || null,
            status: editStatus,
            subdomain: editSubdomain.trim() || null,
        });
        await fetchData();
        setIsSaving(false);
    };
    const handleDuplicate = async () => {
        if (!form) return;
        setIsDuplicating(true);
        try {
            const { data: newForm, error } = await duplicateForm(form.id);
            if (error) {
                toast.error(error);
                return;
            }
            if (newForm) {
                toast.success("Form duplicated successfully!");
                router.push(`/dashboard/forms/${newForm.id}`);
            }
        } catch (error) {
            console.error("Duplication error:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsDuplicating(false);
        }
    };

    const shareUrl = form?.subdomain
        ? `https://${form.subdomain}.genesisflow.io`
        : (typeof window !== "undefined" ? `${window.location.origin}/f/${formId}` : `/f/${formId}`);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsSheetOpen(true);
    };

    // ─── Loading State ────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <DashboardPage className="space-y-6">
                <div className="px-4 md:px-6 lg:px-10 space-y-6">
                    <div className="h-8 w-48 rounded-xl bg-secondary/30 animate-pulse" />
                    <div className="h-10 w-full rounded-xl bg-secondary/20 animate-pulse" />
                    <div className="h-64 w-full rounded-2xl bg-secondary/20 animate-pulse" />
                </div>
            </DashboardPage>
        );
    }

    if (!form) {
        return (
            <DashboardPage className="space-y-6">
                <div className="px-4 md:px-6 lg:px-10 flex flex-col items-center justify-center py-20">
                    <p className="text-muted-foreground">Form not found.</p>
                    <button
                        onClick={() => router.push("/dashboard/forms")}
                        className="mt-4 text-sm font-medium text-primary hover:underline"
                    >
                        ← Back to Forms
                    </button>
                </div>
            </DashboardPage>
        );
    }

    // ─── Computed Stats ───────────────────────────────────────────────────────

    const totalLeads = leads.length;
    const totalViews = form.views || 0;
    const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0.0";

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <DashboardPage>
            {/* Header */}
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 md:px-6 lg:px-10 mb-2"
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/dashboard/forms")}
                        className="p-2 -ml-2 rounded-xl hover:bg-secondary/60 transition-colors"
                        aria-label="Back to forms"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className={cn("text-2xl md:text-3xl font-bold tracking-tight text-foreground", sansFont)}>
                                {form.name}
                            </h1>
                        </div>
                        {form.brands && (
                            <p className="text-sm text-muted-foreground mt-0.5">{form.brands.name}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                            {editStatus === "active" ? "Active" : "Draft"}
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={editStatus === "active"}
                            onClick={async () => {
                                const newStatus = editStatus === "active" ? "draft" : "active";
                                setEditStatus(newStatus);
                                setForm((prev) => prev ? { ...prev, status: newStatus } : prev);
                                await updateForm(form.id, { status: newStatus });
                            }}
                            className={cn(
                                "relative w-11 h-6 flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none",
                                editStatus === "active" ? "bg-emerald-500" : "bg-secondary"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                                    editStatus === "active" ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>

                    <button
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                        className="inline-flex items-center gap-2 bg-secondary/50 text-foreground hover:bg-secondary/80 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm active:scale-95 duration-200 disabled:opacity-50"
                    >
                        {isDuplicating ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                        )}
                        Duplicate
                    </button>

                    <a
                        href={`/builder?formId=${form.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit Form
                    </a>
                </div>
            </motion.div>

            {/* Tabs & Content wrapped for 12px spacing */}
            <div className="flex flex-col gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="px-4 md:px-6 lg:px-10"
                >
                    <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                    activeTab === tab.key
                                        ? "bg-background shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="px-4 md:px-6 lg:px-10"
                    >
                        {activeTab === "leads" && (
                            <LeadsTab
                                leads={leads}
                                steps={steps}
                                totalLeads={totalLeads}
                                totalViews={totalViews}
                                conversionRate={conversionRate}
                                onViewLead={handleViewDetails}
                            />
                        )}
                        {activeTab === "settings" && (
                            <SettingsTab
                                editName={editName}
                                setEditName={setEditName}
                                editWebhook={editWebhook}
                                setEditWebhook={setEditWebhook}
                                editStatus={editStatus}
                                setEditStatus={setEditStatus}
                                editSubdomain={editSubdomain}
                                setEditSubdomain={setEditSubdomain}
                                isSaving={isSaving}
                                onSave={handleSaveSettings}
                                shareUrl={shareUrl}
                                copied={copied}
                                onCopyLink={handleCopyLink}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <LeadDetailsSheet
                lead={selectedLead}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                steps={steps}
            />
        </DashboardPage>
    );
}

// ─── Tab Components ───────────────────────────────────────────────────────────

function LeadsTab({
    leads,
    steps,
    totalLeads,
    totalViews,
    conversionRate,
    onViewLead
}: {
    leads: Lead[];
    steps: FormStep[];
    totalLeads: number;
    totalViews: number;
    conversionRate: string;
    onViewLead: (lead: Lead) => void;
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    if (leads.length === 0) {
        return (
            <div className="space-y-6">
                <PerformanceTab
                    totalLeads={totalLeads}
                    totalViews={totalViews}
                    conversionRate={conversionRate}
                />
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                            <UserGroupIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className={cn("text-lg font-bold tracking-tight mb-1", sansFont)}>No leads captured yet</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Share your form to start collecting leads. They&apos;ll appear here in real time.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Pagination logic
    const totalPages = Math.ceil(leads.length / pageSize);
    const paginatedLeads = leads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Core headers only
    const contactHeaders = [
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" }
    ];

    return (
        <div className="space-y-4 pb-10">
            <PerformanceTab
                totalLeads={totalLeads}
                totalViews={totalViews}
                conversionRate={conversionRate}
            />

            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-secondary/50">
                        <table className={cn("w-full text-sm min-w-[800px]", sansFont)}>
                            <thead>
                                <tr className="border-b border-border/50 bg-secondary/10">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        Submitted
                                    </th>
                                    {contactHeaders.map((header) => (
                                        <th
                                            key={header.key}
                                            className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px]"
                                        >
                                            {header.label}
                                        </th>
                                    ))}
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        Verified
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        Webhook
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {paginatedLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="group hover:bg-secondary/20 transition-colors cursor-pointer"
                                        onClick={() => onViewLead(lead)}
                                    >
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {new Date(lead.created_at).toLocaleDateString("en-AU", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        {contactHeaders.map((header) => (
                                            <td key={header.key} className="px-6 py-4 text-foreground truncate max-w-[180px]" title={String(lead.answers?.[header.key] ?? "—")}>
                                                {lead.answers?.[header.key] || "—"}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tight",
                                                lead.is_sms_verified
                                                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                                    : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                                            )}>
                                                {lead.is_sms_verified ? 'True' : 'False'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {lead.webhook_status ? (
                                                <div className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tight",
                                                    lead.webhook_status >= 200 && lead.webhook_status < 300
                                                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                                        : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                                                )}>
                                                    {lead.webhook_status} {lead.webhook_status === 200 ? 'OK' : 'Error'}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground italic uppercase tracking-tight whitespace-nowrap">Not Sent</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, leads.length)}</span> of <span className="font-medium text-foreground">{leads.length}</span> leads
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
                                        currentPage === page
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function PerformanceTab({
    totalLeads,
    totalViews,
    conversionRate,
}: {
    totalLeads: number;
    totalViews: number;
    conversionRate: string;
}) {
    const stats = [
        { label: "Total Leads", value: totalLeads.toString(), color: "text-blue-500", bg: "bg-blue-500/10", icon: UserGroupIcon },
        { label: "Total Views", value: totalViews.toString(), color: "text-violet-500", bg: "bg-violet-500/10", icon: ChartBarIcon },
        { label: "Conversion Rate", value: `${conversionRate}%`, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: ChartBarIcon },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                            <div className={cn("p-2 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                        </div>
                        <h3 className={cn("text-2xl font-bold tracking-tight", sansFont)}>{stat.value}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function SettingsTab({
    editName,
    setEditName,
    editWebhook,
    setEditWebhook,
    editStatus,
    setEditStatus,
    editSubdomain,
    setEditSubdomain,
    isSaving,
    onSave,
    shareUrl,
    copied,
    onCopyLink,
}: {
    editName: string;
    setEditName: (v: string) => void;
    editWebhook: string;
    setEditWebhook: (v: string) => void;
    editStatus: string;
    setEditStatus: (v: string) => void;
    editSubdomain: string;
    setEditSubdomain: (v: string) => void;
    isSaving: boolean;
    onSave: () => void;
    shareUrl: string;
    copied: boolean;
    onCopyLink: () => void;
}) {
    return (
        <div className="max-w-2xl space-y-4">
            {/* Form Name */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Form Name
                        </label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Subdomain */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Custom Subdomain
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={editSubdomain}
                                onChange={(e) => setEditSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="my-form"
                                className="w-full px-4 py-2.5 rounded-l-xl border border-r-0 border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                            />
                            <div className="px-4 py-2.5 bg-secondary/50 border border-border rounded-r-xl text-sm text-muted-foreground font-medium whitespace-nowrap">
                                .genesisflow.io
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Leave blank to use the default /f/[id] URL. Letters, numbers, and hyphens only. Be careful changing this as existing links will break.
                        </p>
                    </div>

                    {/* Webhook URL */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Webhook URL
                        </label>
                        <input
                            type="url"
                            value={editWebhook}
                            onChange={(e) => setEditWebhook(e.target.value)}
                            placeholder="https://your-webhook.com/endpoint"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                        />
                    </div>

                    {/* Removed Active Toggle from here */}

                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving…" : "Save Settings"}
                    </button>
                </CardContent>
            </Card>

            {/* Share Link */}
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Share Link
                    </label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary/20 text-sm text-muted-foreground overflow-hidden">
                            <LinkIcon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{shareUrl}</span>
                        </div>
                        <button
                            onClick={onCopyLink}
                            className={cn(
                                "shrink-0 p-2.5 rounded-xl border transition-all duration-200",
                                copied
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    : "border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                            )}
                            aria-label="Copy link"
                        >
                            {copied ? (
                                <CheckIcon className="w-4 h-4" />
                            ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
