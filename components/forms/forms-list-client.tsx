"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    sansFont,
    tableBase,
    tableHead,
    tableHeadCell,
    tableRow,
    tableCell,
} from "@/lib/design-system";
import { DocumentTextIcon, ChevronRightIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { AddFormModal } from "@/components/forms/add-form-modal";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Form {
    id: string;
    name: string;
    status: string;
    created_at: string;
    views: number;
    brands?: {
        id: string;
        name: string;
        logo_url: string | null;
    } | null;
}

interface Brand {
    id: string;
    name: string;
    logo_url: string | null;
}

interface FormsListClientProps {
    initialForms: Form[];
    brands: Brand[];
}

export function FormsListClient({ initialForms: forms, brands }: FormsListClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");

    const refreshForms = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const filteredForms = forms.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    const createTrigger = (
        <Button className="rounded-full px-6 gap-2 shrink-0">
            <PlusIcon className="w-4 h-4" />
            Create Form
        </Button>
    );

    if (forms.length === 0) {
        return (
            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center justify-center">
                <div className="max-w-xl w-full mx-auto">
                    <Card className="border-none shadow-none rounded-2xl overflow-hidden bg-transparent">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <DocumentTextIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>Start capturing leads</h2>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                You haven&apos;t created any forms yet. Create your first lead capture form to start growing your business.
                            </p>
                            <AddFormModal brands={brands} trigger={createTrigger} onCreated={refreshForms} />
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div variants={fadeInUp} className={cn("flex flex-col gap-4 w-full max-w-[70%] mx-auto", isPending && "opacity-50")}>
            {/* Local header */}
            <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-semibold tracking-tight", sansFont)}>Forms</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search forms..."
                            className="pl-8 h-9 w-36 sm:w-48 rounded-full text-sm border-border/50 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <AddFormModal brands={brands} trigger={createTrigger} onCreated={refreshForms} />
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell}>Form Name</th>
                            <th className={tableHeadCell}>Brand</th>
                            <th className={tableHeadCell + " hidden sm:table-cell"}>Status</th>
                            <th className={tableHeadCell + " hidden md:table-cell"}>Views</th>
                            <th className={tableHeadCell + " hidden lg:table-cell text-right"}>Created</th>
                            <th className={tableHeadCell + " text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredForms.map((form) => (
                            <tr
                                key={form.id}
                                className={cn(tableRow, "group cursor-pointer transition-colors active:bg-secondary/20")}
                                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                            >
                                <td className={tableCell}>
                                    <div className="flex flex-col gap-0.5">
                                        <span className={cn("font-semibold text-foreground", sansFont)}>{form.name}</span>
                                        <span className="text-[11px] text-muted-foreground font-mono tracking-tighter tabular-nums">{form.id}</span>
                                    </div>
                                </td>
                                <td className={tableCell + " px-4"}>
                                    {form.brands ? (
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-8 h-8 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden flex-shrink-0">
                                                {form.brands.logo_url ? (
                                                    <Image
                                                        src={form.brands.logo_url}
                                                        alt={form.brands.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="32px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-[11px] font-bold text-muted-foreground">{form.brands.name[0]}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-foreground leading-none">{form.brands.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">—</span>
                                    )}
                                </td>
                                <td className={tableCell + " px-4 hidden sm:table-cell"}>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                                        form.status === "published"
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "bg-secondary text-muted-foreground border border-border/50"
                                    )}>
                                        {form.status}
                                    </span>
                                </td>
                                <td className={tableCell + " px-4 hidden md:table-cell text-muted-foreground text-sm font-medium tabular-nums"}>
                                    {form.views?.toLocaleString() || 0}
                                </td>
                                <td className={tableCell + " px-4 hidden lg:table-cell text-right text-muted-foreground text-sm tabular-nums"}>
                                    {format(new Date(form.created_at), "MMM d, yyyy")}
                                </td>
                                <td className={tableCell + " text-right"} onClick={(e) => e.stopPropagation()}>
                                    <Link
                                        href={`/dashboard/forms/${form.id}`}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        aria-label={`Manage ${form.name}`}
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
