import z from "zod";
import { MaterialType, QuantityType, Status } from "@prisma/client";
import { hazardSchema } from "./hazardClass";

export const chemicalSchema = z.object({
    id: z.number().nonnegative(),
    name: z.string(),
    status: z.enum(Status),
    hazardClass: z.array(hazardSchema),
    quantityType: z.enum(QuantityType),
    materialType: z.enum(MaterialType),
    unit: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export type ChemicalRow = z.infer<typeof chemicalSchema>;