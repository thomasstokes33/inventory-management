import prisma from "@/lib/prisma";
import { chemicalSchema } from "@/schemas/chemical";
import { NextRequest, NextResponse } from "next/server";

const ChemicalUpdateSchema = chemicalSchema.partial();

export async function PUT(request : NextRequest, {params} : {params: Promise<{id: string}>}) {
    const body = await request.json();
    const chemicalId  = Number((await params).id);
    const chemicals = await prisma.chemical.update(
        {
            where: {id: chemicalId},
            data: {
                stockQuantity: body.stockQuantity
            }
        }
    );
    return NextResponse.json(chemicals);
}