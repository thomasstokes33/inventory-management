import { generateResponse } from "@/lib/apiRoutes";
import prisma from "@/lib/prisma";
import { getMovementTypeSign, stockMovementCreationSchema } from "@/schemas/stockMovement";
import { MovementType, Prisma, Stock, StockMovement } from "@prisma/client";
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
    const validatedStockMovement = stockMovementCreationSchema.safeParse(newStockMovement);
    if (validatedStockMovement.error) {
        console.log(z.formatError(validatedStockMovement.error));
        return generateResponse<StockMovement>({ error: "Invalid types" }, 400);
    }
    // Extract key values.
    const { chemicalId, locationId, quantity: quantityChange, ...rest } = validatedStockMovement.data;
    const stock = await prisma.stock.findFirst({ select: { id: true, stockQuantity: true }, where: { chemicalId: chemicalId, locationId: locationId} });
    if (!stock) return generateResponse({ error: "Invalid Stock ID" }, 400);
    try {
        const change =  getMovementTypeSign(rest.movementType);
        if (change < 0 && quantityChange > stock.stockQuantity) {
            console.log("Insufficient quantity for transfer"); // Possible complexity, regarding dates of transactions.
            return generateResponse<StockMovement>({ error: "Invalid quantity for movement type" }, 400);
        }
        const newBalance = stock.stockQuantity + change * quantityChange;
        const stockMovementCreationData: Prisma.StockMovementCreateInput = {
            movementType: rest.movementType,
            createdAt: rest.createdAt,
            cost: rest.cost,
            costType: rest.costType,
            stock: { connect: { id: stock.id} },
            quantity: quantityChange,
        };
        if (rest.movementType === MovementType.RECEIPT) stockMovementCreationData.supplier = {connect: {id: rest.supplierId}};
        // Atomic transaction. TODO: Handle transfers and recipes, so that we maintain Consistency of ACID.
        const [stockMovement, updatedStock] = await prisma.$transaction([
            prisma.stockMovement.create({
                data: stockMovementCreationData
            }),
            prisma.stock.update({
                where: { id: stock.id },
                data: {
                    stockQuantity: newBalance
                }
            })
        ]);
        return generateResponse<{ stockMovement: StockMovement, stock: Stock }>({ data: { stockMovement: stockMovement, stock: updatedStock } }, 200);
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) return generateResponse<StockMovement>({ error: "invalid IDs" }, 400);
        return generateResponse<StockMovement>({ error: "unknown error" }, 400);
    }
}