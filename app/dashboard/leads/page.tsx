"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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
import { UserGroupIcon, CalendarIcon, PhoneIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getDashboardLeads } from "@/app/actions/leads";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LeadDetailsSheet } from "@/components/leads/LeadDetailsSheet";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const ITEMS_PER_PAGE = 10;

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchLeads = async () => {
            setIsLoading(true);
            const res = await getDashboardLeads();
            if (res.data) {
                setLeads(res.data);
            }
            setIsLoading(false);
        };
        fetchLeads();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
    const paginatedLeads = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return leads.slice(start, start + ITEMS_PER_PAGE);
    }, [leads, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewDetails = (lead: any) => {
        setSelectedLead(lead);
        setIsSheetOpen(true);
    };

    return (
        <DashboardPage className="space-y-8">
            <DashboardHeader
                title="Leads"
                subtitle="View and manage leads captured from your forms."
            />

            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
                {isLoading ? (
                    <Card className="border-border/50 shadow-sm rounded-2xl">
                        <CardContent className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                            <p className="text-muted-foreground">Loading leads...</p>
                        </CardContent>
                    </Card>
                ) : leads.length === 0 ? (
                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <UserGroupIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No leads found</h2>
                            <p className="text-muted-foreground max-w-md">
                                Once your forms start receiving submissions, the captured leads will appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <div className="w-full overflow-x-auto">
                            <table className={tableBase + " border-collapse min-w-[900px]"}>
                                <thead className={tableHead}>
                                    <tr>
                                        <th className={tableHeadCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>Lead</th>
                                        <th className={tableHeadCell + " px-4"}>Contact</th>
                                        <th className={tableHeadCell + " px-4"}>SMS</th>
                                        <th className={tableHeadCell + " px-4"}>Form</th>
                                        <th className={tableHeadCell + " px-4"}>Webhook</th>
                                        <th className={tableHeadCell + " px-4"}>Captured</th>
                                        <th className={tableHeadCell + " px-4 text-right pr-4 md:pr-6 lg:pr-10"}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLeads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className={cn(tableRow, "group cursor-pointer active:bg-secondary/20")}
                                            onClick={() => handleViewDetails(lead)}
                                        >
                                            <td className={tableCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                                        {(lead.answers?.first_name?.[0] || lead.answers?.email?.[0] || 'L')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{lead.answers?.first_name || 'Anonymous'} {lead.answers?.last_name || ''}</p>
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.answers?.email || 'No email provided'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={tableCell + " px-4"}>
                                                <div className="flex flex-col gap-1">
                                                    {lead.answers?.phone ? (
                                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                            <PhoneIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {lead.answers.phone}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">No phone</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={tableCell + " px-4"}>
                                                {lead.is_sms_verified ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1 rounded-full text-[10px] font-bold uppercase transition-all">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground border-border/50 gap-1 rounded-full text-[10px] font-bold uppercase">
                                                        <XCircleIcon className="w-3 h-3" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className={tableCell + " px-4"}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" title="Form active" />
                                                    <span className="text-sm font-medium">{lead.form_name}</span>
                                                </div>
                                            </td>
                                            <td className={tableCell + " px-4"}>
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
                                                    <span className="text-[10px] text-muted-foreground italic uppercase tracking-tight">Not Sent</span>
                                                )}
                                            </td>
                                            <td className={tableCell + " px-4"}>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-foreground">{format(new Date(lead.created_at), "MMM d")}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(lead.created_at), "h:mm a")}</span>
                                                </div>
                                            </td>
                                            <td className={tableCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right"}>
                                                <button
                                                    className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-all opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(lead);
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <p className="text-xs text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, leads.length)}</span> of <span className="font-semibold text-foreground">{leads.length}</span> leads
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-border/50 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={cn(
                                                "w-8 h-8 rounded-lg text-xs font-semibold transition-all",
                                                currentPage === i + 1
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-border/50 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            <LeadDetailsSheet
                lead={selectedLead}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </DashboardPage>
    );
}
