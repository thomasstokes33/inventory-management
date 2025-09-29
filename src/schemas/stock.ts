import z from "zod";
import { chemicalSchema } from "./chemical";
import { locationSchema } from "./location";

export const stockSchema = z.object({
    id: z.int().nonnegative(),
    chemical: chemicalSchema,
    location: locationSchema,
    stockQuantity: z.number(),
    createdAt: z.date(),
    updatedAt: z.date()
});
