import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard/", "/page-builder/", "/onboarding/", "/auth/callback"],
            },
        ],
        sitemap: "https://genesisflow.io/sitemap.xml",
    };
}
