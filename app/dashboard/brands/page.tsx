import { Suspense } from "react";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { BrandModal } from "@/components/dashboard/BrandModal";
import { getBrands } from "@/app/actions/brands";
import { BrandListClient } from "@/components/dashboard/BrandListClient";
import { Card } from "@/components/ui/card";

export default async function BrandsPage() {
    // Fetch brands on the server
    const { data: brands } = await getBrands();

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
                <BrandModal trigger={addBrandTrigger} />
            </DashboardHeader>

            <Suspense fallback={<BrandsSkeleton />}>
                <BrandListClient initialBrands={brands || []} />
            </Suspense>
        </DashboardPage>
    );
}

function BrandsSkeleton() {
    return (
        <div className="px-4 md:px-6 lg:px-10">
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                                    Brand
                                </th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 hidden sm:table-cell">
                                    Description
                                </th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 hidden md:table-cell">
                                    Verticals
                                </th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50 hidden lg:table-cell">
                                    Created
                                </th>
                                <th className="w-12 border-b border-border/50" />
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
        </div>
    );
}
