import z from "zod";

export const LocationSchema = z.object({
    id: z.int(),
    address: z.string(),
    code: z.string(),
    town: z.string().nullable(),
    country: z.string().nullable()
});