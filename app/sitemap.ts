import { MetadataRoute } from "next";

const BASE_URL = "https://genesisflow.io";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: BASE_URL,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/auth`,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];
}
