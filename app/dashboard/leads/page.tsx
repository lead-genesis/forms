"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { UserGroupIcon, CalendarIcon, PhoneIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getDashboardLeads } from "@/app/actions/leads";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LeadDetailsSheet } from "@/components/leads/LeadDetailsSheet";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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
                    <div className="bg-background border border-border/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-border/50 bg-secondary/30">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Form</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Webhook</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Captured</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="border-b border-border/40 hover:bg-secondary/10 transition-colors group cursor-pointer"
                                        onClick={() => handleViewDetails(lead)}
                                    >
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {lead.answers?.phone ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <PhoneIcon className="w-3.5 h-3.5" />
                                                        {lead.answers.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No phone</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500" title="Form active" />
                                                <span className="text-sm font-medium">{lead.form_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-foreground">{format(new Date(lead.created_at), "MMM d, yyyy")}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(lead.created_at), "h:mm a")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right pr-10">
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
