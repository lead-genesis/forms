"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    UserGroupIcon,
    Cog6ToothIcon,
    ClipboardDocumentListIcon,
    CheckIcon,
    PlayIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import { getForm, getLeadsByForm, updateForm, getFormSteps, duplicateForm } from "@/app/actions/forms";
import { toast } from "sonner";

import { LeadDetailsSheet } from "@/components/leads/LeadDetailsSheet";

import { LeadsTab } from "./_components/LeadsTab";
import { SettingsTab } from "./_components/SettingsTab";

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
    vertical: string | null;
    brands?: {
        id: string;
        name: string;
        logo_url?: string | null;
        banner_url?: string | null;
        verticals?: string[];
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
    const [editVertical, setEditVertical] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [formRes, leadsRes, stepsRes] = await Promise.all([
            getForm(formId),
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
            setEditVertical(f.vertical ?? "");
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
            vertical: editVertical || null,
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
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePreview = () => {
        window.open(`/f/${formId}?preview=true`, "_blank");
    };

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setIsSheetOpen(true);
    };

    // ─── Loading State ────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <DashboardPage className="space-y-6">
                <div className="max-w-[70%] mx-auto w-full space-y-6">
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
                <div className="max-w-[70%] mx-auto w-full flex flex-col items-center justify-center py-20">
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
        <DashboardPage className="pt-3 md:pt-4">
          <div className="w-full max-w-[70%] mx-auto">
            {/* Header */}
            <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2"
            >
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => router.push("/dashboard/forms")}
                        className="flex items-center gap-1.5 -ml-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit cursor-pointer"
                        aria-label="Back to forms"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        Back to Forms
                    </button>
                    <div>
                        <h1 className={cn("text-2xl md:text-3xl font-bold tracking-tight text-foreground", sansFont)}>
                            {form.name}
                        </h1>
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
                        className="btn-outline disabled:opacity-50"
                    >
                        {isDuplicating ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                        )}
                        Duplicate
                    </button>

                    <button
                        onClick={handlePreview}
                        className="btn-outline"
                    >
                        <PlayIcon className="w-4 h-4" />
                        Preview
                    </button>

                    <button
                        onClick={handleCopyLink}
                        className={cn(
                            "btn-outline",
                            copied && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
                        )}
                    >
                        {copied ? (
                            <CheckIcon className="w-4 h-4" />
                        ) : (
                            <ShareIcon className="w-4 h-4" />
                        )}
                        {copied ? "Copied" : "Share"}
                    </button>

                    <a
                        href={`/builder?formId=${form.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200"
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
                                editVertical={editVertical}
                                setEditVertical={setEditVertical}
                                brandVerticals={form.brands?.verticals ?? []}
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
