import z from "zod";
import { QuantityType, Status } from "@prisma/client";



export const chemicalSchema = z.object({
    id: z.number().describe("id"),
    name: z.string().describe("name"),
    stockQuantity: z.number().nullable().describe("stock"),
    quantityType: z.enum(QuantityType),
    unit: z.string().nullable().describe("Special unit if it is unusual, such as sticks or bars, rather than grams."),
    status: z.enum(Status),
    locationId: z.int().describe("location id"),
    supplierId: z.int().describe("supplier id")
});

export type ChemicalDb = z.infer<typeof chemicalSchema>;
export const chemicalTableColumns = [
    {field: "name", label: "name"},
    {field: "stockQuantity", label: "stock", format: (c: ChemicalDb) => {
        let displayVal;
        switch (c.quantityType) {
            case "MASS":
                displayVal =  `${c.stockQuantity} ${c.unit ?? ""}`;
                break;
            case"MASS":
                displayVal = `${c.stockQuantity} g`;
                break;
            case "VOLUME":
                displayVal = `${c.stockQuantity} ml`;
                break;       
        }
        return displayVal;
    }},
    {field: "status", label: "status"},
    {field: "supplier", label: "supplier"},
    {field: "locationId", label: "location"},
    {field: "hazardClassId", label: "hazard class"}
] as const;