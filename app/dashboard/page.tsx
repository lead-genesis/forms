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
    cardGap,
    staggerContainer,
    hoverLift
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-6 lg:px-10">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-secondary/20 animate-pulse rounded-2xl border border-border/50" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-6 lg:px-10">
                    <div className="h-64 bg-secondary/10 animate-pulse rounded-2xl border border-border/50" />
                    <div className="h-64 bg-secondary/10 animate-pulse rounded-2xl border border-border/50" />
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
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-6 lg:px-10`}
            >
                {metrics.map((metric, i) => (
                    <motion.div key={i} variants={fadeInUp} {...hoverLift}>
                        <Card className="border-border/40 shadow-sm overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-border/80">
                            <CardContent className="p-5 md:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={statLabelClass}>{metric.label}</span>
                                    <div className={`p-2.5 rounded-xl ${metric.bg} ring-1 ring-inset ring-foreground/5`}>
                                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className={cn(statValueClass, "text-2xl md:text-3xl", sansFont)}>{metric.value}</h3>
                                    {/* Optional: Add a small trend indicator here if data allowed */}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-6 lg:px-10">
                {/* Top Performing Forms */}
                <motion.div variants={fadeInUp} initial="hidden" animate="show" className="h-full">
                    <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden h-full bg-card/50 backdrop-blur-sm">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                                    <FireIcon className="w-4 h-4 text-orange-500" />
                                </div>
                                <h2 className={cn("text-sm font-bold tracking-tight uppercase", sansFont)}>Top Performing Forms</h2>
                            </div>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter font-bold border-orange-500/20 text-orange-600 bg-orange-500/5 px-2">HOT</Badge>
                        </div>
                        <CardContent className="p-6">
                            {stats?.topForms.length > 0 ? (
                                <div className="space-y-6">
                                    {stats.topForms.map((form: any, i: number) => {
                                        const maxCount = Math.max(...stats.topForms.map((f: any) => f.count));
                                        const percentage = (form.count / maxCount) * 100;
                                        return (
                                            <div key={i} className="group flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold truncate max-w-[200px]">{form.name}</span>
                                                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                        <span className="font-bold text-foreground">{form.count}</span>
                                                        <span>leads</span>
                                                        <span className="text-muted-foreground/30">•</span>
                                                        <span className="text-emerald-500 font-medium">{form.conversionRate.toFixed(1)}% conv.</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                    <ChartBarIcon className="w-8 h-8 opacity-20" />
                                    No form activity yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Brands */}
                <motion.div variants={fadeInUp} initial="hidden" animate="show" className="h-full">
                    <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden h-full bg-card/50 backdrop-blur-sm">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between bg-secondary/20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                    <BriefcaseIcon className="w-4 h-4 text-blue-500" />
                                </div>
                                <h2 className={cn("text-sm font-bold tracking-tight uppercase", sansFont)}>Top Brands</h2>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            {stats?.topBrands.length > 0 ? (
                                <div className="divide-y divide-border/30">
                                    {stats.topBrands.map((brand: any, i: number) => (
                                        <div key={i} className="p-5 flex items-center justify-between hover:bg-secondary/20 transition-all duration-200">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold">{brand.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active Brand</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-base font-bold text-blue-600 tracking-tight">{brand.count}</span>
                                                <div className="px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[9px] font-bold text-blue-500 uppercase">Leads</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                    <BriefcaseIcon className="w-8 h-8 opacity-20" />
                                    No brand activity yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Bottom Section - Recent Leads */}
            <motion.div variants={fadeInUp} initial="hidden" animate="show" className="space-y-5">
                <div className="flex items-center justify-between px-4 md:px-6 lg:px-11">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className={cn("text-sm font-bold tracking-tight uppercase", sansFont)}>Recent Leads</h2>
                    </div>
                    <button className="group text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full ring-1 ring-inset ring-primary/10">
                        View Leads <ArrowUpRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                </div>
                <div className="w-full px-4 md:px-6 lg:px-10">
                    <div className="border border-border/40 rounded-2xl overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
                        <table className={tableBase + " border-collapse min-w-full"}>
                            <thead className={cn(tableHead, "backdrop-blur-md")}>
                                <tr>
                                    <th className={tableHeadCell + " pl-6 pr-4 py-5"}>Lead ID</th>
                                    <th className={tableHeadCell + " px-4 py-5"}>Form</th>
                                    <th className={tableHeadCell + " px-4 py-5"}>Brand</th>
                                    <th className={tableHeadCell + " pl-4 pr-6 py-5 text-right"}>Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {stats?.recentLeads.length > 0 ? (
                                    stats.recentLeads.map((lead: any) => (
                                        <tr key={lead.id} className={cn(tableRow, "hover:bg-secondary/10 group active:bg-secondary/20 transition-all duration-150")}>
                                            <td className={tableCell + " pl-6 pr-4 py-5"}>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={cn("font-mono text-[10px] font-bold text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded border border-border/30 w-fit", sansFont)}>
                                                        {lead.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/60 invisible group-hover:visible transition-all">Click for details</span>
                                                </div>
                                            </td>
                                            <td className={tableCell + " px-4 py-5"}>
                                                <span className="font-bold text-sm text-foreground/90">{lead.formName}</span>
                                            </td>
                                            <td className={tableCell + " px-4 py-5"}>
                                                <Badge variant="outline" className="rounded-full text-[9px] uppercase tracking-tighter font-bold border-blue-500/10 text-blue-600 bg-blue-500/5 px-2 py-0">
                                                    {lead.brandName}
                                                </Badge>
                                            </td>
                                            <td className={tableCellMuted + " pl-4 pr-6 py-5 text-right font-medium text-[11px]"}>
                                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-16 text-center text-muted-foreground text-sm">
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <UsersIcon className="w-10 h-10" />
                                                <p>No recent leads found.</p>
                                            </div>
                                        </td>
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
