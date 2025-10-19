import { generateResponse } from "@/lib/apiRoutes";
import prisma from "@/lib/prisma";
import { stockMovementSchemaNonNested } from "@/schemas/stockMovement";
import { MovementType, Prisma, StockMovement } from "@prisma/client";
import z from "zod";
export async function GET() {
    const stockMovements = await prisma.stockMovement.findMany();
    return generateResponse({ data: stockMovements }, 200);
}

export async function PUT(request: Request) {
    let data;
    try {
        data = await request.json();
    } catch {
        return generateResponse<StockMovement>({ error: "Incorrect format" }, 400);
    }
    const newStockMovement = data;
    // date validation.
    const createdAtStr: string = data.createdAt;
    if (createdAtStr) {
        const createdAt = new Date(createdAtStr);
        if (isNaN(createdAt.getTime())) return generateResponse({ error: "Invalid date format" }, 400);
        newStockMovement.createdAt = createdAt;
    }
    // type validation
    const validatedStockMovement = stockMovementSchemaNonNested.safeParse(newStockMovement);
    if (validatedStockMovement.error) {
        console.log(z.formatError(validatedStockMovement.error));
        return generateResponse<StockMovement>({ error: "Invalid types" }, 400);
    }
    const { supplierId, stockId, quantity: quantityChange, ...rest } = validatedStockMovement.data;
    try {
        const stock = await prisma.stock.findUnique({ select: { stockQuantity: true }, where: { id: stockId } });
        if (!stock) return generateResponse({error: "Invalid Stock ID"}, 400);
        let newBalance : number;
        switch (rest.movementType) {
            case MovementType.TRANSFER_OUT:
            case MovementType.ISSUE:
                if ( quantityChange > stock.stockQuantity) return generateResponse<StockMovement>({ error: "Invalid quantity for movement type" }, 400);
                newBalance = stock.stockQuantity - quantityChange;
                break;
            case MovementType.RECEIPT:
                newBalance = stock.stockQuantity + quantityChange;
                break;
        }
        const [stockMovement, updatedStock] = await prisma.$transaction([
            prisma.stockMovement.create({
                data: {
                    ...rest,
                    stock: { connect: { id: stockId } },
                    supplier: { connect: { id: supplierId } },
                    quantity: quantityChange
                },
            }),
            prisma.stock.update({
                where: {id: stockId},
                data: {
                    stockQuantity: newBalance
                }
            })
        ]);
        //TODO: update the stock quantity too.
        return generateResponse<StockMovement>({ data: stockMovement }, 200);
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) return generateResponse<StockMovement>({ error: "invalid IDs" }, 400);
        return generateResponse<StockMovement>({ error: "unknown error" }, 400);
    }
}