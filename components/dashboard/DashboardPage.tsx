"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardPageProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function DashboardPage({ className, children, ...props }: DashboardPageProps) {
    return (
        <div className={cn("flex-1 flex flex-col gap-6 py-4 md:py-8", className)} {...props}>
            {children}
        </div>
    );
}

interface DashboardControlsProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function DashboardControls({ className, children, ...props }: DashboardControlsProps) {
    const { onAnimationStart: _, onDragStart: __, onDragEnd: ___, onDrag: ____, ...filteredProps } = props;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-4 px-4 md:px-6 lg:px-10", className)}
            {...filteredProps}
        >
            {children}
        </motion.div>
    );
}
