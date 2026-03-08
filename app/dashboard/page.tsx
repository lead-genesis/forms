"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import {
    sansFont,
    tableBase,
    tableHead,
    tableHeadCell,
    tableRow,
    tableCell,
    tableCellMuted,
    statLabelClass,
    statValueClass,
    cardGap
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    UsersIcon,
    ChartBarIcon,
    ArrowUpRightIcon,
    EyeIcon,
    FireIcon,
    BriefcaseIcon
} from "@heroicons/react/24/outline";
import { getDashboardStats } from "@/app/actions/analytics";
import { formatDistanceToNow } from "date-fns";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function DashboardOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            setLoading(true);
            const { data } = await getDashboardStats();
            if (data) {
                setStats(data);
            }
            setLoading(false);
        }
        loadStats();
    }, []);

    const metrics = stats ? [
        {
            label: "Total Leads",
            value: stats.totalLeads.toLocaleString(),
            icon: UsersIcon,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Total Views",
            value: stats.totalViews.toLocaleString(),
            icon: EyeIcon,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Conversion Rate",
            value: `${stats.avgConversionRate.toFixed(2)}%`,
            icon: ChartBarIcon,
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        },
    ] : [];

    if (loading) {
        return (
            <DashboardPage className="space-y-8">
                <DashboardHeader
                    title="Dashboard Overview"
                    subtitle="Loading your platform's performance..."
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-secondary/20 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage className="space-y-6 pb-20">
            <DashboardHeader
                title="Dashboard Overview"
                subtitle="Welcome back. Here's a snapshot of your platform's performance."
            />

            {/* Metrics Grid */}
            <motion.div variants={fadeInUp} initial="hidden" animate="show" className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-6 lg:px-10`}>
                {metrics.map((metric, i) => (
                    <Card key={i} className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className={statLabelClass}>{metric.label}</span>
                                <div className={`p-2 rounded-xl ${metric.bg}`}>
                                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                </div>
                            </div>
                            <h3 className={cn(statValueClass, sansFont)}>{metric.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-6 lg:px-10">
                {/* Top Performing Forms */}
                <motion.div variants={fadeInUp} initial="hidden" animate="show">
                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden h-full">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FireIcon className="w-5 h-5 text-orange-500" />
                                <h2 className={cn("text-sm font-bold tracking-tight", sansFont)}>Top Performing Forms</h2>
                            </div>
                            <button className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">By Leads</button>
                        </div>
                        <CardContent className="p-0">
                            {stats?.topForms.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {stats.topForms.map((form: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{form.name}</span>
                                                <span className="text-[11px] text-muted-foreground">{form.conversionRate.toFixed(1)}% Conversion</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold">{form.count}</span>
                                                <Badge variant="secondary" className="text-[10px] rounded-full">Leads</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-muted-foreground text-sm">No form activity yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Brands */}
                <motion.div variants={fadeInUp} initial="hidden" animate="show">
                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden h-full">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BriefcaseIcon className="w-5 h-5 text-blue-500" />
                                <h2 className={cn("text-sm font-bold tracking-tight", sansFont)}>Top Brands</h2>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            {stats?.topBrands.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {stats.topBrands.map((brand: any, i: number) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                                            <span className="text-sm font-semibold">{brand.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold">{brand.count}</span>
                                                <Badge variant="outline" className="text-[10px] rounded-full">Total Leads</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-muted-foreground text-sm">No brand activity yet.</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Bottom Section - Recent Leads */}
            <motion.div variants={fadeInUp} initial="hidden" animate="show" className="space-y-4">
                <div className="flex items-center justify-between px-4 md:px-6 lg:px-11">
                    <h2 className={cn("text-sm font-bold tracking-tight", sansFont)}>Recent Leads</h2>
                    <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        View All <ArrowUpRightIcon className="w-3 h-3" />
                    </button>
                </div>
                <div className="w-full px-4 md:px-6 lg:px-10">
                    <div className="border border-border/50 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto relative bg-card">
                        <table className={tableBase + " border-collapse min-w-full"}>
                            <thead className={cn(tableHead, "sticky top-0 z-20 bg-secondary/95 backdrop-blur-sm shadow-sm")}>
                                <tr>
                                    <th className={tableHeadCell + " pl-6 pr-4 py-4"}>Lead ID</th>
                                    <th className={tableHeadCell + " px-4 py-4"}>Form</th>
                                    <th className={tableHeadCell + " px-4 py-4"}>Brand</th>
                                    <th className={tableHeadCell + " pl-4 pr-6 py-4"}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentLeads.length > 0 ? (
                                    stats.recentLeads.map((lead: any) => (
                                        <tr key={lead.id} className={tableRow + " border-t border-border/50"}>
                                            <td className={tableCell + " pl-6 pr-4 py-4"}>
                                                <span className={cn("font-mono text-xs text-muted-foreground", sansFont)}>#{lead.id.slice(0, 8)}</span>
                                            </td>
                                            <td className={tableCell + " px-4 py-4"}>
                                                <span className="font-semibold text-sm">{lead.formName}</span>
                                            </td>
                                            <td className={tableCell + " px-4 py-4"}>
                                                <Badge variant="outline" className="rounded-full text-[10px] font-medium border-border/50">
                                                    {lead.brandName}
                                                </Badge>
                                            </td>
                                            <td className={tableCellMuted + " pl-4 pr-6 py-4"}>
                                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No recent leads found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </DashboardPage>
    );
}
