import z from "zod";

export const locationSchema = z.object({
    id: z.int().nonnegative(),
    address: z.string(),
    code: z.string(),
    bin: z.string().nullable(),
    town: z.string().nullable(),
    country: z.string().nullable()
});

export type LocationRecord = z.infer<typeof locationSchema>;