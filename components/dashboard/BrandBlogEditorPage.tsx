"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { cn } from "@/lib/utils";
import { sansFont } from "@/lib/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BlogEditor } from "@/components/dashboard/BlogEditor";
import { createBlog, updateBlog, getBlog } from "@/app/actions/blogs";
import { getBrand } from "@/app/actions/brands";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2Icon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface BrandBlogEditorPageProps {
    params: Promise<{ id: string; blogId: string }>;
}

export default function BrandBlogEditorPage({ params }: BrandBlogEditorPageProps) {
    const { id: brandId, blogId } = use(params);
    const router = useRouter();
    const isEditing = blogId !== "new";

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);

    const [brandName, setBrandName] = useState("Brand");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState<any>({});
    const [isPublished, setIsPublished] = useState(false);
    const [featuredImage, setFeaturedImage] = useState("");
    const [excerpt, setExcerpt] = useState("");

    const backHref = `/dashboard/brands/${brandId}?tab=blogs`;

    useEffect(() => {
        const loadInitialData = async () => {
            // Fetch brand info first
            const { data: brandData } = await getBrand(brandId);
            if (brandData) {
                setBrandName(brandData.name);
            }

            if (isEditing) {
                const { data: blogData, error } = await getBlog(blogId);
                if (error || !blogData) {
                    toast.error("Failed to load blog post");
                    router.push(backHref);
                    return;
                }
                setTitle(blogData.title);
                setSlug(blogData.slug);
                setContent(blogData.content);
                setIsPublished(blogData.is_published);
                setFeaturedImage(blogData.featured_image || "");
                setExcerpt(blogData.excerpt || "");
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [brandId, blogId, isEditing, router, backHref]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!isEditing) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
        }
    };

    const handleSave = async () => {
        if (!title || !slug) {
            toast.error("Please fill in a title and slug");
            return;
        }

        setIsSaving(true);
        const blogInput = {
            brand_id: brandId,
            title,
            slug,
            content,
            excerpt,
            featured_image: featuredImage,
            is_published: isPublished,
        };

        const result = isEditing
            ? await updateBlog(blogId, blogInput)
            : await createBlog(blogInput);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(isEditing ? "Blog updated successfully" : "Blog created successfully");
            router.push(backHref);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const breadcrumbs = [
        { label: "Brands", href: "/dashboard/brands" },
        { label: brandName, href: `/dashboard/brands/${brandId}` },
        { label: "Blogs", href: backHref },
        { label: isEditing ? (title || "Edit Blog") : "New Blog" }
    ];

    return (
        <DashboardPage>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 md:px-6 lg:px-10 mb-2">
                <div className="flex-1 min-w-0">
                    <nav className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
                        {breadcrumbs.map((crumb, idx) => (
                            <span key={idx} className="flex items-center gap-1.5">
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
                                ) : (
                                    <span className="text-muted-foreground/80">{crumb.label}</span>
                                )}
                                {idx < breadcrumbs.length - 1 && <span className="text-muted-foreground/30">/</span>}
                            </span>
                        ))}
                    </nav>
                    <h1 className={cn("text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-1.5", sansFont)}>
                        {isEditing ? (title || "Edit Blog") : "Create New Blog"}
                    </h1>
                </div>
                <div className="flex items-center gap-3 shrink-0 sm:mb-1">
                    <Link href={backHref}>
                        <Button variant="outline" className="rounded-full gap-2">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
                    >
                        {isSaving ? <Loader2Icon className="w-4 h-4 animate-spin" /> : (isEditing ? "Save Changes" : "Create Blog")}
                    </Button>
                </div>
            </div>

            <div className="px-4 md:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Enter blog title"
                                className="rounded-xl border-border/50 bg-background/50 h-12 text-lg font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Content</Label>
                            <BlogEditor
                                content={content}
                                onChange={setContent}
                                placeholder="Write your blog post content here..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">URL Slug</Label>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <span>/blog/</span>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                                        className="h-8 py-0 px-2 rounded-lg border-border/50 bg-background flex-1 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Publish Status</Label>
                                    <p className="text-[11px] text-muted-foreground">Make this blog visible online.</p>
                                </div>
                                <Switch
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                    className="data-[state=checked]:bg-green-500"
                                />
                            </div>

                            <div className="h-px bg-border text-muted-foreground" />

                            <div className="space-y-2">
                                <Label htmlFor="featuredImage" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Featured Image URL</Label>
                                <Input
                                    id="featuredImage"
                                    value={featuredImage}
                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                    placeholder="https://..."
                                    className="rounded-xl border-border/50 bg-background/50 h-10 text-sm"
                                />
                                {featuredImage && (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50 mt-2">
                                        <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Excerpt</Label>
                                <textarea
                                    id="excerpt"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Brief summary shown in listings..."
                                    className="w-full rounded-xl border border-border/50 bg-background/50 p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardPage>
    );
}
