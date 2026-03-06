"use client";

import { motion } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function LeadsPage() {
    return (
        <DashboardPage className="space-y-8">
            <DashboardHeader
                title="Leads"
                subtitle="View and manage leads captured from your forms."
            />

            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                            <UserGroupIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No leads found</h2>
                        <p className="text-muted-foreground max-w-md">
                            Once your forms start receiving submissions, the captured leads will appear here.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </DashboardPage>
    );
}
