"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { TagIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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

    const refreshBrands = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const addBrandTrigger = (
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors shadow-sm active:scale-95 duration-200">
            Add Brand
        </button>
    );

    if (brands.length === 0) {
        return (
            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10 flex-1 flex flex-col items-center justify-center">
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
        <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
            <Card className={cn(
                "border-border/50 shadow-sm rounded-2xl overflow-hidden transition-opacity duration-200",
                isPending ? "opacity-50" : "opacity-100"
            )}>
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
                        onCreated={refreshBrands}
                    />
                </div>
            </Card>
        </motion.div>
    );
}
