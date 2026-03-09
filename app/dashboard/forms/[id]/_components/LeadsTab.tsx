import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { PerformanceTab } from "./PerformanceTab";

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

interface LeadsTabProps {
    leads: Lead[];
    steps: FormStep[];
    totalLeads: number;
    totalViews: number;
    conversionRate: string;
    onViewLead: (lead: Lead) => void;
}

export function LeadsTab({
    leads,
    steps,
    totalLeads,
    totalViews,
    conversionRate,
    onViewLead
}: LeadsTabProps) {
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
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap border-b border-border/50">
                                        Submitted
                                    </th>
                                    {contactHeaders.map((header) => (
                                        <th
                                            key={header.key}
                                            className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[120px] border-b border-border/50"
                                        >
                                            {header.label}
                                        </th>
                                    ))}
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap border-b border-border/50">
                                        Verified
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap border-b border-border/50">
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
