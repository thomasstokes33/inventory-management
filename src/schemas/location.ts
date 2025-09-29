import z from "zod";

export const locationSchema = z.object({
    id: z.int().nonnegative(),
    address: z.string(),
    code: z.string(),
    town: z.string().nullable(),
    country: z.string().nullable()
});