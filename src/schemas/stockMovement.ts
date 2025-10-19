import z from "zod";
import { supplierSchema } from "./supplier";
import { CostType, MovementType } from "@prisma/client";
import { stockSchema } from "./stock";


export const stockMovementSchema = z.object({
    id: z.int().nonnegative(),
    createdAt: z.date().optional(),
    quantity: z.number().positive(),
    supplier: supplierSchema,
    supplierId: z.number().nonnegative().optional(),
    movementType: z.enum(MovementType),
    stockId: z.number().nonnegative(),
    stock: stockSchema,
    cost: z.number().optional(),
    costType: z.enum(CostType),
});

export const stockMovementSchemaNonNested = stockMovementSchema.omit({ id: true, supplier: true, stock: true });
export type StockMovementNonNested = z.infer<typeof stockMovementSchemaNonNested>;
// Creation schemas.
// Extracts the necessary types from movement type, this ensures none are missed and removes duplicates.
const { RECEIPT: receipt, ...reducedMovTypes } = MovementType;
export const baseStockMovementSchema = stockMovementSchemaNonNested.omit({ supplierId: true, stockId: true }).extend({
    movementType: z.enum(reducedMovTypes),
    chemicalId: z.number().nonnegative(),
    locationId: z.number().nonnegative()
});
export const receiptStockMovementSchema = baseStockMovementSchema.extend({
    movementType: z.literal(receipt),
    supplierId: z.number().nonnegative()
});
const discriminatorKey: keyof StockMovementNonNested = "movementType";
export const stockMovementCreationSchema = z.discriminatedUnion(discriminatorKey, [
    receiptStockMovementSchema,
    baseStockMovementSchema
]).superRefine((data, ctx) => {
    if (data.costType === "NONE" && data.cost !== 0) {
        ctx.addIssue("Cost type None, but value is not 0.");
    }
    if (data.cost != null && !data.costType) {
        ctx.addIssue("Cost defined but cost type is undefined or null");
    }
    if (data.costType !== "NONE" && data.cost == null) {
        ctx.addIssue("Cost type is not NONE but cost is undefined.");
    }
});
export type StockMovementCreationSchema = z.infer<typeof stockMovementCreationSchema>;

export function getMovementTypeSign(movType: MovementType) {
    switch (movType) {
        case "DISCARD":
        case "RETURN":
        case "PRODUCTION_USE":
        case "TRANSFER_OUT":
        case "ISSUE":
            return -1;
            break;
        case "RECEIPT":
        case "TRANSFER_IN":
        case "PRODUCTION_MADE":
            return 1;
            break;
        default:
            const mov: never = movType;
            throw new Error(`Unhandled err: ${mov}`);
    }
}