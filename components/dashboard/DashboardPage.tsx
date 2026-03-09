"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { motion } from "framer-motion";

interface DashboardPageProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function DashboardPage({ className, children, ...props }: DashboardPageProps) {
    return (
        <div className={cn("flex-1 flex flex-col gap-6 p-4 md:p-8", className)} {...props}>
            {children}
        </div>
    );
}

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

const headerVariants = {
    hidden: { y: -10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export function DashboardHeader({ title, subtitle, className, children, ...props }: DashboardHeaderProps) {
    const { onAnimationStart: _, onDragStart: __, onDragEnd: ___, onDrag: ____, ...filteredProps } = props;

    return (
        <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="show"
            className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 md:px-6 lg:px-10", className)}
            {...filteredProps}
        >
            <div>
                <h1 className={cn("text-2xl md:text-3xl font-bold tracking-tight text-foreground", sansFont)}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        {subtitle}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </motion.div>
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
