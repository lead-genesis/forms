import { MetadataRoute } from "next";

export default async function robots({ params }: { params: Promise<{ host: string }> }): Promise<MetadataRoute.Robots> {
    const { host } = await params;
    const decodedHost = decodeURIComponent(host);
    const baseUrl = `https://${decodedHost}`;

    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
