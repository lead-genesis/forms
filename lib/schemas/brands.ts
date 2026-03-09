import { z } from "zod";

export const HeaderConfigSchema = z.object({
    customLogoUrl: z.string().optional().nullable(),
    logoHeight: z.number().min(16).max(80).optional().default(32),
    navigation: z.array(z.string()).optional().default([]),
    navFontSize: z.number().min(10).max(24).optional().default(13),
}).optional().nullable();

export type HeaderConfig = z.infer<typeof HeaderConfigSchema>;

export const CreateBrandSchema = z.object({
    name: z.string().min(1, "Brand name is required").max(100),
    description: z.string().max(500).optional().nullable(),
    verticals: z.array(z.string()).optional().default([]),
    logoFile: z.string().optional().nullable(),
    bannerFile: z.string().optional().nullable(),
    logo_url: z.string().optional().nullable(),
    custom_domain: z.string().optional().nullable(),
    subdomain: z.string().optional().nullable(),
    seo_title: z.string().max(120).optional().nullable(),
    seo_description: z.string().max(320).optional().nullable(),
    og_image_url: z.string().url().optional().nullable().or(z.literal("")),
    header_config: HeaderConfigSchema,
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
