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
    updatedAt: z.date(),
    archived: z.boolean()
});
export const stockNonNested = stockSchema.omit({chemical: true, location: true});
export const stockCreationSchema = stockSchema.pick({ locationId: true, chemicalId: true });
export const stockEditingSchema = stockSchema.pick({archived: true});
export type StockRecord = z.infer<typeof stockSchema>;
export type StockRecordNonNested = z.infer<typeof stockNonNested>;
