"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { TagIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { BrandModal } from "@/components/dashboard/BrandModal";
import { getBrands } from "@/app/actions/brands";

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
                    /* Loading skeleton */
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-48 rounded-2xl bg-secondary/30 animate-pulse" />
                        ))}
                    </div>
                ) : brands.length === 0 ? (
                    /* Empty state */
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
                    /* Brand grid */
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {brands.map((brand) => (
                            <motion.div
                                key={brand.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group rounded-2xl border border-border/50 bg-background shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Banner */}
                                <div className="h-28 w-full bg-secondary/40 relative overflow-hidden">
                                    {brand.banner_url ? (
                                        <img src={brand.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <PhotoIcon className="w-8 h-8 text-muted-foreground/20" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="px-5 pb-5 pt-0 relative">
                                    {/* Logo overlapping banner */}
                                    <div className="w-14 h-14 rounded-2xl border-2 border-background bg-secondary/30 overflow-hidden -mt-7 mb-3 shadow-sm">
                                        {brand.logo_url ? (
                                            <img src={brand.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <TagIcon className="w-5 h-5 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className={cn("text-base font-semibold text-foreground truncate", sansFont)}>
                                        {brand.name}
                                    </h3>

                                    {brand.verticals && brand.verticals.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {brand.verticals.slice(0, 2).map((v) => (
                                                <span key={v} className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Add more card */}
                        <BrandModal
                            trigger={
                                <div className="rounded-2xl border-2 border-dashed border-border/50 h-full min-h-[190px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer bg-secondary/10">
                                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                                        <TagIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[13px] font-medium">Add Brand</span>
                                </div>
                            }
                            onCreated={fetchBrands}
                        />
                    </div>
                )}
            </motion.div>
        </DashboardPage>
    );
}
