import z from "zod";


export const supplierSchema = z.object({
    id: z.int().nonnegative(),
    name: z.string(),
    email: z.email(),
});
