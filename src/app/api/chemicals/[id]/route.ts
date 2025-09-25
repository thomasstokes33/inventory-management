import prisma from "@/lib/prisma";
import { chemicalSchema } from "@/schemas/chemical";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rawChemId = (await params).id;
    if (rawChemId === "") {
        return NextResponse.json({error: "Invalid ID"}, {status: 400});
    }
    const chemId = Number(rawChemId);
    const stockSchema = chemicalSchema.pick({ stockQuantity: true, id: true });
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({error: "Incorrect format"}, {status: 400});
    }
    body.id = chemId;
    try {
        stockSchema.parse(body);
    } catch (err) {
        if (err instanceof ZodError) {
            err = z.treeifyError(err);
        }
        return NextResponse.json({error: err}, {status: 400});
    } 
    
    const chemical = await prisma.chemical.update(
        {
            where: { id: chemId },
            data: {
                stockQuantity: body.stockQuantity
            }
        }
    );
    return NextResponse.json(chemical);
}
