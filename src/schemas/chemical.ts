import z from "zod";
import { QuantityType, Status } from "@prisma/client";
import { supplierSchema } from "./supplier";
import { HazardSchema } from "./hazardClass";
import { LocationSchema } from "./location";


export const chemicalSchema = z.object({
    id: z.number().describe("id"),
    name: z.string().describe("name"),
    stockQuantity: z.number().nullable().describe("stock"),
    quantityType: z.enum(QuantityType),
    unit: z.string().nullable().describe("Special unit if it is unusual, such as sticks or bars, rather than grams."),
    status: z.enum(Status),
    location: LocationSchema.nullable(),
    supplier: supplierSchema,
    hazardClass: z.array(HazardSchema)
});

export type ChemicalRow = z.infer<typeof chemicalSchema>;

