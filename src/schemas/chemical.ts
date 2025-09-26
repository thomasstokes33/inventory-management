import z from "zod";
import { MaterialType, QuantityType, Status } from "@prisma/client";
import { HazardSchema } from "./hazardClass";

export const chemicalSchema = z.object({
    id: z.number().nonnegative(),
    name: z.string(),
    status: z.enum(Status),
    hazardClass: z.array(HazardSchema),
    quantityType: z.enum(QuantityType),
    materialType: z.enum(MaterialType),
    unit: z.string().nullable()
});

export type ChemicalRow = z.infer<typeof chemicalSchema>;