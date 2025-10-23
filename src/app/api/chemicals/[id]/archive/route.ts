import { generateResponse, validId } from "@/lib/apiRoutes";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{id: string}> }) {
    const rawChemId = (await params).id;
    if (!validId(rawChemId)) return generateResponse({ error: "Invalid ID" }, 400);
    const chemId = Number(rawChemId);
    try {
        const [stock, chemical] = await prisma.$transaction([
        prisma.stock.updateMany({
            data: {
                archived: true
                },
                where: { chemicalId: chemId }
            }),
            prisma.chemical.update({
                where: {id: chemId},
                data : {
                    status: "ARCHIVED"
                }
            })
        ]);
        return generateResponse({data: {stock: stock, chemical: chemical}},200);
    } catch {
        return generateResponse({error: "Invalid IDs"}, 400);
    }

}