"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DashboardPage, DashboardHeader } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { sansFont } from "@/lib/design-system";
import { DocumentTextIcon, PlusIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getBlogs, updateBlog } from "@/app/actions/blogs";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

const fadeInUp = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

interface Blog {
    id: string;
    title: string;
    slug: string;
    created_at: string;
    is_published: boolean;
    brand_id: string;
    brands?: {
        name: string;
    };
    featured_image?: string | null;
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true);
        const { data } = await getBlogs();
        setBlogs(data as Blog[]);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    return (
        <DashboardPage className="space-y-8">
            <DashboardHeader
                title="Blogs"
                subtitle="Create and manage rich text content for your brands."
            >
                <Link
                    href="/dashboard/blogs/new"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm active:scale-95 duration-200 flex items-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    New Blog
                </Link>
            </DashboardHeader>

            <motion.div variants={fadeInUp} className="px-4 md:px-6 lg:px-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-2xl bg-secondary/30 animate-pulse" />
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="max-w-xl w-full mx-auto">
                            <Card className="border-none shadow-none rounded-2xl overflow-hidden bg-transparent">
                                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                                        <DocumentTextIcon className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h2 className={cn("text-xl font-bold tracking-tight mb-2", sansFont)}>No blogs created yet</h2>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        Start sharing stories and updates by creating your first blog post.
                                    </p>
                                    <Link
                                        href="/dashboard/blogs/new"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm active:scale-95 duration-200"
                                    >
                                        Create First Blog
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group rounded-2xl border border-border/50 bg-background shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
                            >
                                <div className="h-40 w-full bg-secondary/40 relative overflow-hidden">
                                    {blog.featured_image ? (
                                        <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <DocumentTextIcon className="w-10 h-10 text-muted-foreground/20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-black/5 shadow-sm">
                                        <span className={cn(
                                            "text-[10px] font-bold select-none",
                                            blog.is_published ? "text-green-600" : "text-amber-600"
                                        )}>
                                            {blog.is_published ? "Published" : "Draft"}
                                        </span>
                                        <Switch
                                            checked={blog.is_published}
                                            onCheckedChange={async (checked) => {
                                                setBlogs(current => current.map(b => b.id === blog.id ? { ...b, is_published: checked } : b));
                                                await updateBlog(blog.id, { is_published: checked });
                                            }}
                                            className="scale-75 origin-right"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-md">
                                            {blog.brands?.name || "No Brand"}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            {format(new Date(blog.created_at), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    <h3 className={cn("text-lg font-bold text-foreground mb-3 line-clamp-2", sansFont)}>
                                        {blog.title}
                                    </h3>
                                    <div className="mt-auto flex items-center justify-between">
                                        <Link
                                            href={`/dashboard/blogs/${blog.id}`}
                                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 group/link"
                                        >
                                            Edit Post
                                            <PlusIcon className="w-3 h-3 rotate-45 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                        <div className="flex gap-2">
                                            {/* Preview action could go here */}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </DashboardPage>
    );
}
