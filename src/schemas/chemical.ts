import z from "zod";
import { MaterialType, QuantityType, Status } from "@prisma/client";
import { hazardSchema } from "./hazardClass";

export const chemicalSchema = z.object({
    id: z.number().nonnegative(),
    name: z.string().toLowerCase(),
    status: z.enum(Status),
    hazardClass: z.array(hazardSchema),
    quantityType: z.enum(QuantityType),
    materialType: z.enum(MaterialType),
    unit: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const chemicalSchemaWithTotalStockAndSynonyms = chemicalSchema.extend({ totalQuantity: z.number().nonnegative(), synonyms: z.array(z.object({synonym: z.string()}))});
export type ChemicalRecordWithTotalStockAndSynonyms = z.infer<typeof chemicalSchemaWithTotalStockAndSynonyms>;
export type ChemicalRecord = z.infer<typeof chemicalSchema>;

export const chemicalCreationSchema = chemicalSchema.pick({
    name: true,
    quantityType: true,
    status: true,
    materialType: true,
    unit: true
}).partial({ unit: true });
export type ChemicalCreation = z.infer<typeof chemicalCreationSchema>;
export const chemicalCreationSchemaWithHazardClasses = chemicalCreationSchema.extend({
    hazardClassIds: z.array(z.number())
});
export type ChemicalCreationSchemaWithHazardClasses = z.infer<typeof chemicalCreationSchemaWithHazardClasses>;