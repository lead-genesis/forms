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
import { TagIcon, ChevronRightIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { BrandModal } from "@/components/dashboard/BrandModal";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Brand {
    id: string;
    name: string;
    description?: string;
    verticals?: string[];
    logo_url?: string | null;
    banner_url?: string | null;
    created_at: string;
}

interface BrandListClientProps {
    initialBrands: Brand[];
}

export function BrandListClient({ initialBrands: brands }: BrandListClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");

    const refreshBrands = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const filteredBrands = brands.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const addBrandTrigger = (
        <Button className="rounded-full px-6 gap-2 shrink-0">
            <PlusIcon className="w-4 h-4" />
            Add Brand
        </Button>
    );

    if (brands.length === 0) {
        return (
            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center justify-center">
                <div className="max-w-xl w-full mx-auto">
                    <Card className="border-none shadow-none rounded-2xl overflow-hidden bg-transparent">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <TagIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No brands defined</h2>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Setup your brands to organise forms and leads more effectively.
                            </p>
                            <BrandModal trigger={addBrandTrigger} onCreated={refreshBrands} />
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
                <h3 className={cn("text-lg font-semibold tracking-tight", sansFont)}>Brands</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search brands..."
                            className="pl-8 h-9 w-36 sm:w-48 rounded-full text-sm border-border/50 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <BrandModal trigger={addBrandTrigger} onCreated={refreshBrands} />
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell}>Brand</th>
                            <th className={tableHeadCell + " hidden sm:table-cell"}>Description</th>
                            <th className={tableHeadCell + " hidden md:table-cell"}>Verticals</th>
                            <th className={tableHeadCell + " hidden lg:table-cell"}>Created</th>
                            <th className={tableHeadCell + " text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBrands.map((brand) => (
                            <tr
                                key={brand.id}
                                className={cn(tableRow, "group cursor-pointer transition-colors active:bg-secondary/20")}
                                onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                            >
                                <td className={tableCell}>
                                    <Link
                                        href={`/dashboard/brands/${brand.id}`}
                                        className="flex items-center gap-3 no-underline text-foreground"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative w-10 h-10 rounded-xl border border-border/50 bg-secondary/30 overflow-hidden flex-shrink-0">
                                            {brand.logo_url ? (
                                                <Image
                                                    src={brand.logo_url}
                                                    alt={brand.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="40px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <TagIcon className="w-5 h-5 text-muted-foreground/40" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={cn("font-semibold", sansFont)}>{brand.name}</span>
                                    </Link>
                                </td>
                                <td className={tableCell + " px-4 hidden sm:table-cell text-muted-foreground text-sm max-w-[200px]"}>
                                    <span className="line-clamp-2">{brand.description || "—"}</span>
                                </td>
                                <td className={tableCell + " px-4 hidden md:table-cell"}>
                                    {brand.verticals && brand.verticals.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {brand.verticals.slice(0, 3).map((v) => (
                                                <span
                                                    key={v}
                                                    className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full"
                                                >
                                                    {v}
                                                </span>
                                            ))}
                                            {brand.verticals.length > 3 && (
                                                <span className="text-[11px] text-muted-foreground">
                                                    +{brand.verticals.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">—</span>
                                    )}
                                </td>
                                <td className={tableCell + " px-4 hidden lg:table-cell text-muted-foreground text-sm"}>
                                    {format(new Date(brand.created_at), "MMM d, yyyy")}
                                </td>
                                <td className={tableCell + " text-right"} onClick={(e) => e.stopPropagation()}>
                                    <Link
                                        href={`/dashboard/brands/${brand.id}`}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        aria-label={`Manage ${brand.name}`}
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
