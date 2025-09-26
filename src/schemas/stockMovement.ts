import z from "zod";
import { supplierSchema } from "./supplier";
import { CostType, MovementType } from "@prisma/client";
import { stockSchema } from "./stock";


export const stockMovementSchema = z.object({
    id: z.int().nonnegative(),
    createdAt: z.date(),
    quantity: z.number(),
    supplier: supplierSchema,
    movementType: z.enum(MovementType),
    stock: stockSchema,
    cost: z.number().nullable(),
    costType: z.enum(CostType).nullable()
});