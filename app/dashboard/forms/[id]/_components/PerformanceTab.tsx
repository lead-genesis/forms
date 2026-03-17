import React from "react";
import { UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";

interface PerformanceTabProps {
    totalLeads: number;
    totalViews: number;
    conversionRate: string;
}

export function PerformanceTab({
    totalLeads,
    totalViews,
    conversionRate,
}: PerformanceTabProps) {
    const stats = [
        {
            label: "Total Leads",
            value: totalLeads.toString(),
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            icon: UserGroupIcon
        },
        {
            label: "Total Views",
            value: totalViews.toString(),
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            icon: ChartBarIcon
        },
        {
            label: "Conversion Rate",
            value: `${conversionRate}%`,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            icon: ChartBarIcon
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="p-5 flex items-center justify-between rounded-xl bg-background/50 border border-border/40 hover:border-border/80 transition-colors">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {stat.label}
                        </span>
                        <h3 className={cn("text-2xl font-bold tracking-tight", sansFont)}>
                            {stat.value}
                        </h3>
                    </div>
                    <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                </div>
            ))}
        </div>
    );
}
