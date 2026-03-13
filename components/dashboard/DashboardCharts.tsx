"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";

interface ChartData {
    name: string;
    count: number;
    color?: string;
    conversionRate?: number;
}

interface BarChartProps {
    data: ChartData[];
    maxDisplay?: number;
}

export function DashboardBarChart({ data, maxDisplay = 5 }: BarChartProps) {
    const displayData = data.slice(0, maxDisplay);
    const maxCount = Math.max(...displayData.map(d => d.count), 1);

    return (
        <div className="space-y-4">
            {displayData.map((item, i) => {
                const pct = (item.count / maxCount) * 100;
                return (
                    <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="truncate max-w-[150px]">{item.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{item.count}</span>
                                {item.conversionRate !== undefined && (
                                    <span className="text-[10px] text-emerald-500">{item.conversionRate.toFixed(1)}%</span>
                                )}
                            </div>
                        </div>
                        <div className="relative h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.3)]"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface DonutChartProps {
    data: ChartData[];
}

export function DashboardDonutChart({ data }: DonutChartProps) {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    let cumulativePercent = 0;

    // Fixed color palette
    const colors = [
        "stroke-blue-500",
        "stroke-violet-500",
        "stroke-emerald-500",
        "stroke-amber-500",
        "stroke-rose-500",
    ];

    return (
        <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-secondary/20"
                    />
                    {data.map((item, i) => {
                        const percent = (item.count / total) * 100;
                        const dashArray = `${percent * 2.513} 251.3`;
                        const dashOffset = `-${cumulativePercent * 2.513}`;
                        cumulativePercent += percent;

                        return (
                            <motion.circle
                                key={item.name}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeWidth="12"
                                strokeDasharray={dashArray}
                                strokeDashoffset={251.3} // Start hidden
                                animate={{ strokeDashoffset: parseFloat(dashOffset) }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                strokeLinecap="round"
                                className={cn(colors[i % colors.length])}
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={cn("text-lg font-bold", sansFont)}>{total}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total</span>
                </div>
            </div>

            <div className="flex-1 space-y-2">
                {data.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", colors[i % colors.length].replace("stroke-", "bg-"))} />
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[100px]">
                                {item.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span className="text-foreground">{item.count}</span>
                            <span className="text-[10px] text-muted-foreground/50">
                                ({Math.round((item.count / total) * 100)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
