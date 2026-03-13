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
        <div className={cn("flex-1 flex flex-col gap-6 py-4 md:py-8", className)} {...props}>
            {children}
        </div>
    );
}

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: React.ReactNode;
}

const headerVariants = {
    hidden: { y: -10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export function DashboardHeader({ title, subtitle, breadcrumbs, className, children, ...props }: DashboardHeaderProps) {
    const { onAnimationStart: _, onDragStart: __, onDragEnd: ___, onDrag: ____, ...filteredProps } = props;

    return (
        <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="show"
            className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 md:px-6 lg:px-10 mb-2", className)}
            {...filteredProps}
        >
            <div className="flex-1 min-w-0">
                {breadcrumbs && (
                    <nav className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-primary transition-colors flex items-center gap-1.5">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground/80">{crumb.label}</span>
                                )}
                                {idx < breadcrumbs.length - 1 && (
                                    <ChevronRightIcon className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className={cn("text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-1.5", sansFont)}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground/80 text-sm md:text-base max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3 shrink-0 sm:mb-1">
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
