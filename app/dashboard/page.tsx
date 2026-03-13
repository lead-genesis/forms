"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import {
    sansFont,
    statLabelClass,
    statValueClass,
    staggerContainer,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    UsersIcon,
    ChartBarIcon,
    ArrowUpRightIcon,
    EyeIcon,
    FireIcon,
    BriefcaseIcon,
    ChevronDownIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";
import { getDashboardStats } from "@/app/actions/analytics";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { DashboardBarChart, DashboardDonutChart } from "@/components/dashboard/DashboardCharts";

const fadeUp = {
    hidden: { y: 8, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const DATE_RANGES = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
    { label: "All time", value: "all" },
];

function getStartDate(range: string): string | undefined {
    if (range === "all") return undefined;
    const d = new Date();
    d.setHours(0, 0, 0, 0); // Start of day

    if (range === "today") {
        return d.toISOString();
    }
    if (range === "yesterday") {
        d.setDate(d.getDate() - 1);
        return d.toISOString();
    }

    d.setDate(d.getDate() - parseInt(range));
    return d.toISOString();
}

function getEndDate(range: string): string | undefined {
    if (range === "yesterday") {
        const d = new Date();
        d.setHours(0, 0, 0, 0); // Start of today = End of yesterday
        return d.toISOString();
    }
    return undefined;
}

function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-lg bg-secondary/30", className)} />;
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("30");
    const [firstName, setFirstName] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return;
            const { data: profile } = await supabase
                .from("profiles")
                .select("first_name")
                .eq("id", user.id)
                .single();
            setFirstName(profile?.first_name || null);
        });
    }, []);

    useEffect(() => {
        async function loadStats() {
            setLoading(true);
            const startDate = getStartDate(dateRange);
            const endDate = getEndDate(dateRange);
            const { data } = await getDashboardStats(startDate, endDate);
            if (data) setStats(data);
            setLoading(false);
        }
        loadStats();
    }, [dateRange]);

    const metrics = [
        {
            label: "Total Leads",
            value: (stats?.totalLeads ?? 0).toLocaleString(),
            icon: UsersIcon,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Total Revenue",
            value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
            icon: BanknotesIcon,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Conversion Rate",
            value: `${(stats?.avgConversionRate ?? 0).toFixed(2)}%`,
            icon: ChartBarIcon,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
    ];

    return (
        <DashboardPage className="pb-12">
            <div className="flex flex-col gap-6 max-w-[70%] mx-auto w-full">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h3 className={cn("text-lg font-semibold tracking-tight", sansFont)}>
                            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Here&apos;s an overview of your lead activity.
                        </p>
                    </div>
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                            className={cn(
                                "appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium cursor-pointer",
                                "border border-border/50 bg-background text-foreground",
                                "hover:border-border/80 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                            )}
                        >
                            {DATE_RANGES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50" />
                    </div>
                </motion.div>

                {/* ── Metric Cards ── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {loading
                        ? [1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)
                        : metrics.map((m, i) => (
                              <motion.div
                                  key={i}
                                  variants={fadeUp}
                                  className="p-5 flex items-center justify-between rounded-xl bg-background/50 border border-border/40 hover:border-border/80 transition-colors"
                              >
                                  <div className="flex flex-col gap-1">
                                      <span className={statLabelClass}>
                                          {m.label}
                                      </span>
                                      <span className={cn(statValueClass, "text-2xl", sansFont)}>
                                          {m.value}
                                      </span>
                                  </div>
                                  <div className={cn("p-2.5 rounded-lg", m.bg)}>
                                      <m.icon className={cn("w-5 h-5", m.color)} />
                                  </div>
                              </motion.div>
                          ))}
                </motion.div>

                {/* ── Two-col: Top Forms + Top Brands ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-8">

                    {/* Top Performing Forms */}
                    <motion.div variants={fadeUp} initial="hidden" animate="show">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FireIcon className="w-4 h-4 text-orange-500" />
                                <span className={cn("text-xs font-bold uppercase tracking-wide text-foreground/80", sansFont)}>
                                    Top Forms
                                </span>
                                <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold border-orange-500/20 text-orange-500 bg-orange-500/5 px-1.5 py-0 h-4">
                                    Hot
                                </Badge>
                            </div>
                        </div>
                        <div className="pt-2 pb-4 min-h-[180px]">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                                </div>
                            ) : stats?.topForms.length > 0 ? (
                                <DashboardBarChart data={stats.topForms} />
                            ) : (
                                <div className="py-8 h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
                                    <ChartBarIcon className="w-6 h-6" />
                                    <span className="text-xs">No activity in this period</span>
                                </div>
                            )}
                        </div>
                        </div>
                    </motion.div>

                    {/* Top Brands */}
                    <motion.div variants={fadeUp} initial="hidden" animate="show">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <BriefcaseIcon className="w-4 h-4 text-blue-500" />
                            <span className={cn("text-xs font-bold uppercase tracking-wide text-foreground/80", sansFont)}>
                                Top Brands
                            </span>
                        </div>
                        <div className="pt-2 pb-4 min-h-[180px]">
                            {loading ? (
                                <div className="flex items-center gap-8">
                                    <Skeleton className="w-32 h-32 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
                                    </div>
                                </div>
                            ) : stats?.topBrands.length > 0 ? (
                                <DashboardDonutChart data={stats.topBrands} />
                            ) : (
                                <div className="py-8 h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
                                    <BriefcaseIcon className="w-6 h-6" />
                                    <span className="text-xs">No activity in this period</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
                </div>

                {/* ── Recent Leads ── */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="pt-12">
                    <div className="flex flex-col gap-4">
                        {/* Section header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className={cn("text-xs font-bold uppercase tracking-wide text-foreground/80", sansFont)}>
                                    Recent Leads
                                </span>
                            </div>
                            <button className="group flex items-center gap-1 text-[10px] font-semibold text-primary/70 hover:text-primary transition-colors">
                                View all
                                <ArrowUpRightIcon className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}
                            </div>
                        ) : stats?.recentLeads.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-border/20">
                                            {["Lead ID", "Form", "Brand", "Time"].map((h, i) => (
                                                <th
                                                    key={h}
                                                    className={cn(
                                                        "py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
                                                        i === 3 && "text-right"
                                                    )}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                <tbody className="divide-y divide-border/30">
                                    {stats.recentLeads.map((lead: any) => (
                                        <tr
                                            key={lead.id}
                                            className="hover:bg-muted/30 transition-colors duration-100 group"
                                        >
                                            <td className="py-2.5">
                                                <span className="font-mono text-[10px] font-bold text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded border border-border/30">
                                                    {lead.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-2.5">
                                                <span className="text-sm font-medium">{lead.formName}</span>
                                            </td>
                                            <td className="py-2.5">
                                                <Badge variant="outline" className="rounded-full text-[9px] uppercase tracking-tighter font-bold border-blue-500/10 text-blue-600 bg-blue-500/5 px-2 py-0">
                                                    {lead.brandName}
                                                </Badge>
                                            </td>
                                            <td className="py-2.5 text-right text-xs text-muted-foreground font-medium tabular-nums">
                                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-10 flex flex-col items-center gap-1.5 text-muted-foreground/40">
                                <UsersIcon className="w-7 h-7" />
                                <span className="text-xs">No leads in this period</span>
                            </div>
                        )}
                        </div>
                    </motion.div>

            </div>
        </DashboardPage>
    );
}
