import { z } from "zod";

export const CreateVerticalSchema = z.object({
    name: z.string().min(1, "Vertical name is required").max(100),
});

export type CreateVerticalInput = z.infer<typeof CreateVerticalSchema>;
