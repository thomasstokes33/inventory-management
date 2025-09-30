import prisma from "@/lib/prisma";
import { ChemicalRecord, chemicalSchema } from "@/schemas/chemical";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rawChemId = (await params).id;
    if (rawChemId === "") { // Handle zero length string, otherwise the chem ID becomes zero.
        return NextResponse.json({error: "Invalid ID"}, {status: 400});
    }
    const chemId = Number(rawChemId);
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({error: "Incorrect format"}, {status: 400});
    }
    const chemical : ChemicalRecord = body;
    chemical.id = chemId;
    const hazardClassOmittedChemicalSchema = chemicalSchema.omit({createdAt: true,hazardClass: true});
    let parsedChem;
    try {
        chemical.updatedAt = new Date();
        parsedChem = hazardClassOmittedChemicalSchema.parse(chemical);
    } catch (err) {
        console.log(z.formatError(err as ZodError));
        return NextResponse.json({error: z.treeifyError(err as ZodError)}, {status: 400});
    }
    const updatedChemical = await prisma.chemical.update({
        where: {
            id: chemId
        }, data: parsedChem});
    return NextResponse.json({updatedChemical}, {status: 200});
}

