import prisma from "@/lib/prisma";
import { ChemicalRecord, chemicalSchema } from "@/schemas/chemical";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { StatusCode } from "status-code-enum";
const hazardClassOmittedChemicalSchema = chemicalSchema.omit({ createdAt: true, hazardClass: true });
type ChemicalHazardClassOmitted = z.infer<typeof hazardClassOmittedChemicalSchema>;
function generateResponse<T extends ChemicalHazardClassOmitted>(body: { error: string } | { chemical: T } | { errors: string[] }, status: StatusCode) {
    return NextResponse.json(body, { status: status });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const rawChemId = (await params).id;
    // Handle zero length string, otherwise the chem ID becomes zero.
    if (rawChemId === "") return generateResponse({ error: "Invalid ID" }, 400);
    // Check ID is a number.
    const chemId = Number(rawChemId);
    if (isNaN(chemId)) return generateResponse({ error: "Non string ID" }, 400);
    // Check ID is within range.
    const promise = await prisma.chemical.findUnique({ where: { id: chemId } });
    if (!promise) return generateResponse({ error: "Chemical does not exist" }, 400);
    // Check JSON
    let body;
    try {
        body = await request.json();
    } catch (e) {
        console.log(e);
        return generateResponse({ error: "Invalid format" }, 400);
    }
    // Validate via Zod.
    const chemical: ChemicalRecord = body;
    chemical.id = chemId;
    let parsedChem;
    try {
        chemical.updatedAt = new Date();
        parsedChem = hazardClassOmittedChemicalSchema.parse(chemical);
    } catch (e) {
        const err = e as ZodError;
        console.log(z.formatError(err));
        return generateResponse(z.treeifyError(err), 400);
    }
    // update DB.
    const updatedChemical = await prisma.chemical.update({
        where: {
            id: chemId
        }, data: { status: parsedChem.status, materialType: parsedChem.materialType } // Currently only these fields can be updated.
    });
    return generateResponse({ chemical: updatedChemical }, 200);
}