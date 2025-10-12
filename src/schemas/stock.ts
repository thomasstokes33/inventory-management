import z from "zod";
import { locationSchema } from "./location";
import { chemicalSchema } from "./chemical";

export const stockSchema = z.object({
    id: z.int().nonnegative(),
    location: locationSchema,
    locationId: z.int().nonnegative(),
    chemicalId: z.int().nonnegative(),
    chemical: chemicalSchema,
    stockQuantity: z.number(),
    createdAt: z.date(),
    updatedAt: z.date()
});
