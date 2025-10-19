import prisma from "@/lib/prisma";
import { ChemicalRecord, chemicalSchema } from "@/schemas/chemical";
import { NextRequest, NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiResponse, generateResponse } from "@/lib/apiRoutes";
const hazardClassOmittedChemicalSchema = chemicalSchema.omit({ createdAt: true, hazardClass: true });
type ChemicalHazardClassOmitted = z.infer<typeof hazardClassOmittedChemicalSchema>;


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) : Promise<NextResponse<ApiResponse<ChemicalHazardClassOmitted>>>{
    const rawChemId = (await params).id;
    // Handle zero length string, otherwise the chem ID becomes zero.
    if (rawChemId === "") return generateResponse<ChemicalHazardClassOmitted>({ error: "Invalid ID" }, 400);
    // Check ID is a number.
    const chemId = Number(rawChemId);
    if (isNaN(chemId)) return generateResponse<ChemicalHazardClassOmitted>({ error: "Non string ID" }, 400);
    // Check JSON
    let body;
    try {
        body = await request.json();
    } catch (e) {
        console.log(e);
        return generateResponse<ChemicalHazardClassOmitted>({ error: "Invalid format" }, 400);
    }
    // Validate via Zod.
    const chemical: ChemicalRecord = body;
    chemical.id = chemId;
    let parsedChem;
    let out : NextResponse<ApiResponse<ChemicalHazardClassOmitted>>;
    try {
        chemical.updatedAt = new Date();
        parsedChem = hazardClassOmittedChemicalSchema.parse(chemical);
        // update DB.
        const updatedChemical = await prisma.chemical.update({
            where: {
                id: chemId
            }, data: { status: parsedChem.status, materialType: parsedChem.materialType } // Currently only these fields can be updated.
        });
        out = generateResponse<ChemicalHazardClassOmitted>({data : updatedChemical}, 200);
    } catch (e) {
        if (e instanceof ZodError) {
            const err = e as ZodError;
            console.log(z.formatError(err));
            out = generateResponse<ChemicalHazardClassOmitted>(z.treeifyError(err), 400);
        } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(e.message);
            out = generateResponse<ChemicalHazardClassOmitted>({error: "invalid ID"}, 400);
        } else {
            out = generateResponse<ChemicalHazardClassOmitted>({error: "unexpected err"}, 400);
        }
    }
    return out;
}