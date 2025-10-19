import { generateResponse } from "@/lib/apiRoutes";
import prisma from "@/lib/prisma";
import { stockEditingSchema, StockRecordNonNested } from "@/schemas/stock";
import { Prisma } from "@prisma/client";
import z, { ZodError } from "zod";


export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const rawStockId = (await params).id;
    if (rawStockId === "") return generateResponse({ error: "Invalid ID" }, 400);
    // Check ID is a number.
    const stockId = Number(rawStockId);
    if (isNaN(stockId)) return generateResponse({ error: "Non string ID" }, 400);
    let out; 
    try {
        const body = await request.json();
        const validatedStock = stockEditingSchema.parse(body);
        const updatedStock = await prisma.stock.update({where: {id: stockId}, data: {
            archived: validatedStock.archived
        }});
        out = generateResponse<StockRecordNonNested>({data: updatedStock}, 200);
    } catch (err) {
        if (err instanceof SyntaxError) {
            out = generateResponse({error: "Invalid format"}, 400);
        } else if (err instanceof ZodError) {
            console.log(z.prettifyError(err));
            out = generateResponse(z.treeifyError(err), 400);
        } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
            out = generateResponse({error: "Non-existent stock"}, 400);
        } else {
            out = generateResponse({error: "Unexpected error"}, 500);
        }  
    }
    return out;

}