import z from "zod";
import { chemicalSchema } from "./chemical";
import { LocationSchema } from "./location";

export const stockSchema = z.object({
    id: z.int().nonnegative(),
    chemical: chemicalSchema,
    location: LocationSchema,
    stockQuantity: z.number(),
    createdAt: z.date(),
    updatedAt: z.date()
});
