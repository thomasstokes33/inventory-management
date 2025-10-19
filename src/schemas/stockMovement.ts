import z from "zod";
import { supplierSchema } from "./supplier";
import { CostType, MovementType } from "@prisma/client";
import { stockSchema } from "./stock";


export const stockMovementSchema = z.object({
    id: z.int().nonnegative(),
    createdAt: z.date().optional(),
    quantity: z.number().positive(),
    supplier: supplierSchema,
    supplierId: z.number().nonnegative(),
    movementType: z.enum(MovementType),
    stockId: z.number().nonnegative(),
    stock: stockSchema,
    cost: z.number().optional(),
    costType: z.enum(CostType).optional(),
});

export const stockMovementSchemaNonNested = stockMovementSchema.omit({id: true, supplier: true, stock: true});
export type StockMovementNonNested = z.infer<typeof stockMovementSchemaNonNested>;