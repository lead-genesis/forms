"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
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
import { RectangleStackIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { AddVerticalModal } from "@/components/dashboard/AddVerticalModal";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Vertical {
    id: string;
    name: string;
    created_at: string;
}

interface VerticalListClientProps {
    initialVerticals: Vertical[];
}

export function VerticalListClient({ initialVerticals: verticals }: VerticalListClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");

    const refreshVerticals = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const filteredVerticals = verticals.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
    );

    const addVerticalTrigger = (
        <Button className="rounded-full px-6 gap-2 shrink-0">
            <PlusIcon className="w-4 h-4" />
            Add Vertical
        </Button>
    );

    if (verticals.length === 0) {
        return (
            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center justify-center">
                <div className="max-w-xl w-full mx-auto">
                    <Card className="border-none shadow-none rounded-2xl overflow-hidden bg-transparent">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <RectangleStackIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No verticals defined</h2>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Create industry verticals to categorise your brands and forms.
                            </p>
                            <AddVerticalModal trigger={addVerticalTrigger} onCreated={refreshVerticals} />
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
                <h3 className={cn("text-lg font-semibold tracking-tight", sansFont)}>Verticals</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search verticals..."
                            className="pl-8 h-9 w-36 sm:w-48 rounded-full text-sm border-border/50 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <AddVerticalModal trigger={addVerticalTrigger} onCreated={refreshVerticals} />
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell}>Name</th>
                            <th className={tableHeadCell + " hidden lg:table-cell"}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVerticals.map((vertical) => (
                            <tr
                                key={vertical.id}
                                className={cn(tableRow, "group transition-colors")}
                            >
                                <td className={tableCell}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-center flex-shrink-0">
                                            <RectangleStackIcon className="w-4 h-4 text-muted-foreground/40" />
                                        </div>
                                        <span className={cn("font-semibold", sansFont)}>{vertical.name}</span>
                                    </div>
                                </td>
                                <td className={tableCell + " px-4 hidden lg:table-cell text-muted-foreground text-sm"}>
                                    {format(new Date(vertical.created_at), "MMM d, yyyy")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
