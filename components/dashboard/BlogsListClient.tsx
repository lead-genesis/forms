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
import { NewspaperIcon, ChevronRightIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Blog {
    id: string;
    brand_id: string;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    brands?: { name: string } | null;
}

interface Brand {
    id: string;
    name: string;
}

interface BlogsListClientProps {
    initialBlogs: Blog[];
    brands: Brand[];
}

export function BlogsListClient({ initialBlogs: blogs, brands }: BlogsListClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");

    const filteredBlogs = blogs.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    const newBlogHref = `/dashboard/blogs/new`;

    if (blogs.length === 0) {
        return (
            <motion.div variants={fadeInUp} className="flex-1 flex flex-col items-center justify-center">
                <div className="max-w-xl w-full mx-auto">
                    <Card className="border-none shadow-none rounded-2xl overflow-hidden bg-transparent">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                <NewspaperIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No blog posts yet</h2>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Create blog posts under your brands to start publishing content.
                            </p>
                            <Link href={newBlogHref}>
                                <Button className="rounded-full px-6 gap-2">
                                    <PlusIcon className="w-4 h-4" />
                                    New Blog
                                </Button>
                            </Link>
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
                <h3 className={cn("text-lg font-semibold tracking-tight", sansFont)}>Blogs</h3>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search blogs..."
                            className="pl-8 h-9 w-36 sm:w-48 rounded-full text-sm border-border/50 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Link href={newBlogHref}>
                        <Button className="rounded-full px-6 gap-2 shrink-0">
                            <PlusIcon className="w-4 h-4" />
                            New Blog
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className={tableBase + " border-collapse min-w-full"}>
                    <thead className={tableHead}>
                        <tr>
                            <th className={tableHeadCell}>Title</th>
                            <th className={tableHeadCell + " hidden sm:table-cell"}>Brand</th>
                            <th className={tableHeadCell + " hidden md:table-cell"}>Status</th>
                            <th className={tableHeadCell + " hidden lg:table-cell text-right"}>Created</th>
                            <th className={tableHeadCell + " text-right"}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBlogs.map((blog) => {
                            const editHref = `/dashboard/blogs/${blog.id}`;
                            return (
                                <tr
                                    key={blog.id}
                                    className={cn(tableRow, "group cursor-pointer transition-colors active:bg-secondary/20")}
                                    onClick={() => router.push(editHref)}
                                >
                                    <td className={tableCell}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className={cn("font-semibold text-foreground", sansFont)}>{blog.title}</span>
                                            <span className="text-[11px] text-muted-foreground">/{blog.slug}</span>
                                        </div>
                                    </td>
                                    <td className={tableCell + " px-4 hidden sm:table-cell text-sm text-muted-foreground"}>
                                        {blog.brands?.name || "—"}
                                    </td>
                                    <td className={tableCell + " px-4 hidden md:table-cell"}>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                                            blog.is_published
                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                : "bg-secondary text-muted-foreground border border-border/50"
                                        )}>
                                            {blog.is_published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className={tableCell + " px-4 hidden lg:table-cell text-right text-muted-foreground text-sm tabular-nums"}>
                                        {format(new Date(blog.created_at), "MMM d, yyyy")}
                                    </td>
                                    <td className={tableCell + " text-right"} onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            href={editHref}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                            aria-label={`Edit ${blog.title}`}
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
