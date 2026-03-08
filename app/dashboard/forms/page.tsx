"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { DocumentTextIcon, TagIcon, ClockIcon, PlayIcon, ShareIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { AddFormModal } from "@/components/dashboard/AddFormModal";
import { getForms } from "@/app/actions/forms";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Form {
    id: string;
    name: string;
    status: string;
    created_at: string;
    brand_id: string;
    subdomain: string | null;
    brands?: {
        id: string;
        name: string;
        logo_url?: string | null;
    };
}

export default function FormsPage() {
    const router = useRouter();
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchForms = useCallback(async () => {
        setIsLoading(true);
        const { data } = await getForms();
        setForms(data as Form[]);
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchForms(); }, [fetchForms]);

    const addFormTrigger = (
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200">
            Add Form
        </button>
    );

    return (
        <DashboardPage className="space-y-8">
            <DashboardHeader
                title="Forms"
                subtitle="Manage and create your lead capture forms."
            >
                <AddFormModal trigger={addFormTrigger} onCreated={fetchForms} />
            </DashboardHeader>

            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
                {isLoading ? (
                    /* Loading skeleton – matches brand grid */
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-48 rounded-2xl bg-secondary/30 animate-pulse" />
                        ))}
                    </div>
                ) : forms.length === 0 ? (
                    /* Empty state */
                    <div className="max-w-xl mx-auto">
                        <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                    <DocumentTextIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No forms created yet</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Create your first form to start capturing leads from your audience.
                                </p>
                                <AddFormModal trigger={addFormTrigger} onCreated={fetchForms} />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Forms grid – same layout as brands */
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {forms.map((form) => (
                            <motion.div
                                key={form.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -2 }}
                                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                                className="group rounded-2xl border border-border/50 bg-background shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                            >
                                {/* Banner area – gradient accent matching form status */}
                                <div className={cn(
                                    "h-28 w-full relative overflow-hidden flex items-center justify-center",
                                    form.status === "active"
                                        ? "bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent"
                                        : "bg-secondary/40"
                                )}>
                                    <DocumentTextIcon className="w-10 h-10 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                                </div>

                                {/* Info section */}
                                <div className="px-5 pb-5 pt-0 relative">
                                    {/* Brand logo overlapping banner */}
                                    <div className="w-14 h-14 rounded-2xl border-2 border-background bg-secondary/30 overflow-hidden -mt-7 mb-3 shadow-sm flex items-center justify-center">
                                        {form.brands?.logo_url ? (
                                            <img src={form.brands.logo_url} alt={form.brands.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <TagIcon className="w-5 h-5 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    <h3 className={cn("text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors", sansFont)}>
                                        {form.name}
                                    </h3>

                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <ClockIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                                        <span className="text-[11px] text-muted-foreground/70">
                                            {new Date(form.created_at).toLocaleDateString("en-AU", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`/f/${form.id}?preview=true`, "_blank");
                                                }}
                                                className="p-1.5 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-90"
                                                title="Preview"
                                            >
                                                <PlayIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const shareUrl = form.subdomain
                                                        ? `https://${form.subdomain}.genesisflow.io`
                                                        : `${window.location.origin}/f/${form.id}`;
                                                    window.open(shareUrl, "_blank");
                                                }}
                                                className="p-1.5 rounded-xl bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-90"
                                                title="Open Live Form"
                                            >
                                                <ShareIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                            form.status === "active"
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                : "bg-secondary text-muted-foreground border-border/50"
                                        )}>
                                            {form.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add more card */}
                        <AddFormModal
                            trigger={
                                <div className="rounded-2xl border-2 border-dashed border-border/50 h-full min-h-[190px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer bg-secondary/10">
                                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                                        <DocumentTextIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[13px] font-medium">Add Form</span>
                                </div>
                            }
                            onCreated={fetchForms}
                        />
                    </div>
                )}
            </motion.div>
        </DashboardPage>
    );
}
