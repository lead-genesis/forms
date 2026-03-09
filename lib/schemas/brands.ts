import { z } from "zod";

export const CreateBrandSchema = z.object({
    name: z.string().min(1, "Brand name is required").max(100),
    description: z.string().max(500).optional().nullable(),
    verticals: z.array(z.string()).optional().default([]),
    logoFile: z.string().optional().nullable(),
    bannerFile: z.string().optional().nullable(),
    custom_domain: z.string().optional().nullable(),
    subdomain: z.string().optional().nullable(),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
