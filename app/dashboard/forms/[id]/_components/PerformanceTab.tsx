import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
                <Card key={stat.label} className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {stat.label}
                            </span>
                            <div className={cn("p-2 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-4 h-4", stat.color)} />
                            </div>
                        </div>
                        <h3 className={cn("text-2xl font-bold tracking-tight", sansFont)}>
                            {stat.value}
                        </h3>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
