"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sansFont } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { BlogEditor } from "@/components/dashboard/BlogEditor";
import { createBlog, updateBlog, getBlog } from "@/app/actions/blogs";
import { getBrands } from "@/app/actions/brands";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ChevronLeftIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";

interface Brand {
    id: string;
    name: string;
}

interface BlogEditorPageProps {
    params: Promise<{ id?: string }>;
}

export default function BlogEditorPage({ params }: BlogEditorPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState<any>({});
    const [brandId, setBrandId] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [featuredImage, setFeaturedImage] = useState("");
    const [excerpt, setExcerpt] = useState("");

    useEffect(() => {
        const brandIdFromUrl = searchParams.get("brand_id");
        if (!isEditing && brandIdFromUrl) {
            setBrandId(brandIdFromUrl);
        }
    }, [searchParams, isEditing]);

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: brandsData } = await getBrands();
            setBrands(brandsData as Brand[]);

            if (isEditing) {
                const { data: blogData, error } = await getBlog(id!);
                if (error || !blogData) {
                    toast.error("Failed to load blog post");
                    router.push("/dashboard/blogs");
                    return;
                }
                setTitle(blogData.title);
                setSlug(blogData.slug);
                setContent(blogData.content);
                setBrandId(blogData.brand_id);
                setIsPublished(blogData.is_published);
                setFeaturedImage(blogData.featured_image || "");
                setExcerpt(blogData.excerpt || "");
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [id, isEditing, router]);

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!isEditing) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
        }
    };

    const handleSave = async () => {
        if (!title || !slug || !brandId) {
            toast.error("Please fill in title, slug and select a brand");
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
            ? await updateBlog(id!, blogInput)
            : await createBlog(blogInput);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(isEditing ? "Blog updated successfully" : "Blog created successfully");
            router.push("/dashboard/blogs");
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

    return (
        <DashboardPage>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 md:px-6 lg:px-10 mb-2">
                <div className="flex-1 min-w-0">
                    <h1 className={cn("text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-1.5", sansFont)}>
                        {isEditing ? "Edit Blog" : "New Blog"}
                    </h1>
                    <p className="text-muted-foreground/80 text-sm md:text-base max-w-2xl leading-relaxed">
                        {isEditing ? "Update your blog post content." : "Create a new blog post for your brand."}
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 sm:mb-1">
                    <Link href="/dashboard/blogs">
                        <Button variant="outline" className="rounded-full">Cancel</Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
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
                                <Label htmlFor="brand" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Brand Association</Label>
                                <Select value={brandId} onValueChange={setBrandId}>
                                    <SelectTrigger id="brand" className="rounded-xl border-border/50 h-11">
                                        <SelectValue placeholder="Select a brand" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
