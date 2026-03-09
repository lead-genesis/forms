"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { TagIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { BrandModal } from "@/components/dashboard/BrandModal";
import { getBrands } from "@/app/actions/brands";
import { format } from "date-fns";

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

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBrands = useCallback(async () => {
        setIsLoading(true);
        const { data } = await getBrands();
        setBrands(data as Brand[]);
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    const addBrandTrigger = (
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200">
            Add Brand
        </button>
    );

    return (
        <DashboardPage className="space-y-8">
            <DashboardHeader
                title="Brands"
                subtitle="Manage your brand assets and configurations."
            >
                <BrandModal trigger={addBrandTrigger} onCreated={fetchBrands} />
            </DashboardHeader>

            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
                {isLoading ? (
                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Brand
                                        </th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                                            Description
                                        </th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                                            Verticals
                                        </th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                                            Created
                                        </th>
                                        <th className="w-12" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="border-b border-border/30 last:border-0">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-secondary/30 animate-pulse" />
                                                    <div className="h-4 w-24 bg-secondary/30 rounded animate-pulse" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 hidden sm:table-cell">
                                                <div className="h-4 w-32 bg-secondary/30 rounded animate-pulse" />
                                            </td>
                                            <td className="py-4 px-5 hidden md:table-cell">
                                                <div className="h-5 w-20 bg-secondary/30 rounded-full animate-pulse" />
                                            </td>
                                            <td className="py-4 px-5 hidden lg:table-cell">
                                                <div className="h-4 w-20 bg-secondary/30 rounded animate-pulse" />
                                            </td>
                                            <td className="py-4 px-5" />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : brands.length === 0 ? (
                    <div className="max-w-xl mx-auto">
                        <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                    <TagIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No brands defined</h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Setup your brands to organise forms and leads more effectively.
                                </p>
                                <BrandModal trigger={addBrandTrigger} onCreated={fetchBrands} />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/30">
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Brand
                                        </th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                                            Description
                                        </th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                                            Verticals
                                        </th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                                            Created
                                        </th>
                                        <th className="w-12" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {brands.map((brand) => (
                                        <tr
                                            key={brand.id}
                                            className="border-b border-border/30 last:border-0 group hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="py-4 px-5">
                                                <Link
                                                    href={`/dashboard/brands/${brand.id}`}
                                                    className="flex items-center gap-3 no-underline text-foreground"
                                                >
                                                    <div className="w-10 h-10 rounded-xl border border-border/50 bg-secondary/30 overflow-hidden flex-shrink-0">
                                                        {brand.logo_url ? (
                                                            <img
                                                                src={brand.logo_url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
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
                                            <td className="py-4 px-5 hidden sm:table-cell text-muted-foreground text-sm max-w-[200px]">
                                                <span className="line-clamp-2">
                                                    {brand.description || "—"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 hidden md:table-cell">
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
                                            <td className="py-4 px-5 hidden lg:table-cell text-muted-foreground text-sm">
                                                {format(new Date(brand.created_at), "MMM d, yyyy")}
                                            </td>
                                            <td className="py-4 px-5">
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
                        <div className="border-t border-border/50 p-3 bg-muted/20">
                            <BrandModal
                                trigger={
                                    <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/50">
                                        <TagIcon className="w-4 h-4" />
                                        Add Brand
                                    </button>
                                }
                                onCreated={fetchBrands}
                            />
                        </div>
                    </Card>
                )}
            </motion.div>
        </DashboardPage>
    );
}
