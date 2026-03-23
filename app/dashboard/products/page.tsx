"use client";

import { useState } from "react";
import { DashboardPage, DashboardControls } from "@/components/dashboard/DashboardPage";
import {
    sansFont,
    tableBase,
    tableHead,
    tableHeadCell,
    tableRow,
    tableCell,
    tableCellMuted
} from "@/lib/design-system";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowUpRightIcon
} from "@heroicons/react/24/outline";

const products = [
    { id: "P1", name: "Cloud Platform Pro", sku: "CPP-001", category: "Software", price: "$99.00", stock: "Unlimited", status: "Active" },
    { id: "P2", name: "Edge Computing Suite", sku: "ECS-002", category: "Infrastructure", price: "$149.00", stock: "Unlimited", status: "Active" },
    { id: "P3", name: "Data Analytics Hub", sku: "DAH-003", category: "Analytics", price: "$49.00", stock: "Unlimited", status: "Draft" },
    { id: "P4", name: "Security Gateway", sku: "SG-004", category: "Security", price: "$199.00", stock: "50 units", status: "Active" },
    { id: "P5", name: "API Management Tool", sku: "API-005", category: "Software", price: "$79.00", stock: "Unlimited", status: "Active" },
];

export default function ProductsPage() {
    const [search, setSearch] = useState("");

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardPage>
            <div className="flex flex-col gap-4 w-full max-w-[70%] mx-auto">
            <DashboardControls>
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search products or SKU..."
                        className="pl-9 rounded-xl border-border/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button className="rounded-full px-6 shrink-0">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </DashboardControls>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>Product Name</th>
                            <th className={tableHeadCell + " px-4 hidden sm:table-cell"}>SKU</th>
                            <th className={tableHeadCell + " px-4"}>Category</th>
                            <th className={tableHeadCell + " px-4 text-right sm:text-left"}>Price</th>
                            <th className={tableHeadCell + " px-4 hidden sm:table-cell"}>Status</th>
                            <th className={tableHeadCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className={tableRow + " group cursor-pointer"}>
                                <td className={tableCell + " pl-4 md:pl-6 lg:pl-10 pr-4"}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-foreground/50 border border-border/50 shrink-0">
                                            {product.id}
                                        </div>
                                        <span className={cn("font-semibold text-sm truncate", sansFont)}>{product.name}</span>
                                    </div>
                                </td>
                                <td className={tableCellMuted + " px-4 hidden sm:table-cell"}>
                                    {product.sku}
                                </td>
                                <td className={tableCell + " px-4"}>
                                    <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px] font-medium border-border/50">
                                        {product.category}
                                    </Badge>
                                </td>
                                <td className={tableCell + " px-4 text-right sm:text-left"}>
                                    <span className={cn("font-bold text-sm", sansFont)}>{product.price}</span>
                                </td>
                                <td className={tableCell + " px-4 hidden sm:table-cell"}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                        <span className="text-xs font-medium text-muted-foreground">{product.status}</span>
                                    </div>
                                </td>
                                <td className={tableCell + " pl-4 pr-4 md:pr-6 lg:pr-10 text-right md:opacity-0 md:group-hover:opacity-100 transition-opacity"}>
                                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-muted-foreground">
                                        <ArrowUpRightIcon className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        </DashboardPage>
    );
}
