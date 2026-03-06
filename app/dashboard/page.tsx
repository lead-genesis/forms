"use client";

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
    CurrencyDollarIcon,
    UsersIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowUpRightIcon
} from "@heroicons/react/24/outline";

const metrics = [
    {
        label: "Total Revenue",
        value: "$45,231.89",
        change: "+20.1%",
        trend: "up",
        icon: CurrencyDollarIcon,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        label: "Active Users",
        value: "2,350",
        change: "+180.1%",
        trend: "up",
        icon: UsersIcon,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        label: "Conversion Rate",
        value: "4.35%",
        change: "+12.2%",
        trend: "up",
        icon: ChartBarIcon,
        color: "text-violet-500",
        bg: "bg-violet-500/10"
    },
];

const recentActivity = [
    { id: "1", user: "Alice Thompson", action: "Purchased Pro License", amount: "$99.00", status: "Success", date: "2 mins ago" },
    { id: "2", user: "Bob Richards", action: "Subscription Renewal", amount: "$149.00", status: "Success", date: "1 hour ago" },
    { id: "3", user: "Charlie Davis", action: "Refund Issued", amount: "-$49.00", status: "Processed", date: "3 hours ago" },
    { id: "4", user: "Diana Prince", action: "New Team Member Invite", amount: "$0.00", status: "Pending", date: "5 hours ago" },
];

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function DashboardOverview() {
    return (
        <DashboardPage className="space-y-8">
            <DashboardHeader
                title="Dashboard Overview"
                subtitle="Welcome back. Here's a snapshot of your platform's performance."
            />

            {/* Metrics Grid */}
            <motion.div variants={fadeInUp} className={`grid grid-cols-1 md:grid-cols-3 ${cardGap} px-4 md:px-6 lg:px-10`}>
                {metrics.map((metric, i) => (
                    <Card key={i} className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={statLabelClass}>{metric.label}</span>
                                <div className={`p-2 rounded-xl ${metric.bg}`}>
                                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className={cn(statValueClass, sansFont)}>{metric.value}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-semibold text-emerald-500">{metric.change}</span>
                                        <span className="text-[10px] text-muted-foreground ml-1">vs last month</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Main Section - Chart Placeholder */}
            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-border/50 flex items-center justify-between">
                            <h2 className={cn("text-sm font-bold tracking-tight", sansFont)}>Monthly Performance</h2>
                            <Badge variant="secondary" className="rounded-full font-medium">Last 30 Days</Badge>
                        </div>
                        <div className="h-[300px] bg-secondary/20 flex flex-col items-center justify-center relative group overflow-hidden">
                            {/* Abstract Chart Representation */}
                            <div className="flex items-end gap-3 h-32 mb-4">
                                {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85, 60, 95].map((h, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${h}%` }}
                                        className="w-3 bg-foreground/10 rounded-full transition-all group-hover:bg-foreground/20"
                                    />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-sm font-medium">Performance Metrics (Visual Placeholder)</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-1">Real-time data synchronization is active</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bottom Section - Recent Activity */}
            <motion.div variants={fadeInUp} className="space-y-4">
                <div className="flex items-center justify-between px-4 md:px-6 lg:px-11">
                    <h2 className={cn("text-sm font-bold tracking-tight", sansFont)}>Recent Transactions</h2>
                    <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        View All <ArrowUpRightIcon className="w-3 h-3" />
                    </button>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className={tableBase + " border-collapse min-w-full"}>
                        <thead className={tableHead}>
                            <tr>
                                <th className={tableHeadCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>Customer</th>
                                <th className={tableHeadCell + " px-4"}>Activity</th>
                                <th className={tableHeadCell + " px-4"}>Amount</th>
                                <th className={tableHeadCell + " px-4"}>Status</th>
                                <th className={tableHeadCell + " pl-4 pr-4 md:pr-6 lg:pr-10"}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((activity) => (
                                <tr key={activity.id} className={tableRow}>
                                    <td className={tableCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>
                                        <span className={cn("font-semibold text-sm", sansFont)}>{activity.user}</span>
                                    </td>
                                    <td className={tableCellMuted + " px-4"}>
                                        {activity.action}
                                    </td>
                                    <td className={tableCell + " px-4"}>
                                        <span className={`font-bold ${activity.amount.startsWith('-') ? 'text-rose-500' : 'text-foreground'}`}>
                                            {activity.amount}
                                        </span>
                                    </td>
                                    <td className={tableCell + " px-4"}>
                                        <Badge variant="outline" className="rounded-full text-[10px] font-medium border-border/50">
                                            {activity.status}
                                        </Badge>
                                    </td>
                                    <td className={tableCellMuted + " pl-4 pr-4 md:pr-6 lg:pr-10"}>
                                        {activity.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </DashboardPage>
    );
}
