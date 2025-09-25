import z from "zod";


export const supplierSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.email(),
});
