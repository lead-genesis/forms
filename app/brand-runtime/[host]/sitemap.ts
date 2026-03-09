import { MetadataRoute } from "next";
import { getBrandByDomain } from "@/app/actions/brands";
import { getPublicBrandPages } from "@/app/actions/pages";
import { getPublicBlogs } from "@/app/actions/blogs";

export default async function sitemap({ params }: { params: Promise<{ host: string }> }): Promise<MetadataRoute.Sitemap> {
    const { host } = await params;
    const decodedHost = decodeURIComponent(host);
    const baseUrl = `https://${decodedHost}`;

    const { data: brand } = await getBrandByDomain(decodedHost);
    if (!brand) return [];

    const [{ data: pages }, { data: blogs }] = await Promise.all([
        getPublicBrandPages(brand.id),
        getPublicBlogs(brand.id),
    ]);

    const pageEntries: MetadataRoute.Sitemap = (pages || []).map((page) => ({
        url: page.is_index || page.slug === "index"
            ? baseUrl
            : `${baseUrl}/${page.slug}`,
        lastModified: new Date(page.updated_at),
        changeFrequency: "weekly",
        priority: page.is_index ? 1.0 : 0.8,
    }));

    const blogEntries: MetadataRoute.Sitemap = (blogs || []).map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.created_at),
        changeFrequency: "monthly",
        priority: 0.6,
    }));

    const blogsListEntry: MetadataRoute.Sitemap = blogs && blogs.length > 0
        ? [{ url: `${baseUrl}/blogs`, changeFrequency: "weekly", priority: 0.7 }]
        : [];

    return [...pageEntries, ...blogsListEntry, ...blogEntries];
}
