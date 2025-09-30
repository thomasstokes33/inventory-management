import prisma from "@/lib/prisma";
import { chemicalSchema } from "@/schemas/chemical";
import {  NextResponse } from "next/server";
import z from "zod";

export async function GET() {
    const chemicals = await prisma.chemical.findMany();
    return NextResponse.json(chemicals);
}

const chemicalCreationSchema = chemicalSchema.pick({ name: true, quantityType: true, status: true, materialType: true, unit: true }).partial({unit:true});
export async function PUT(request: Request) {
    let formData : FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({error: "Incorrect format"}, {status: 400});
    }
    const newChemical: Record<string, string|string[]> = {};
    for (const pair of formData) {
        if (typeof pair[1] == "string" && pair[1].length > 0) {
            newChemical[pair[0]] = pair[1];
        } else {
            console.warn(`Skipping field: ${pair[0]}`);
        }
    }
    const hazardClassIds = formData.getAll("hazardClass");
    const hazardClasses : {id : number}[] = [];
    let incorrectlyFormatedHazardClasses = false;
    for (const hazardClass of hazardClassIds) {
        const hazardClassId = Number(hazardClass);
        if (isNaN(hazardClassId)) {
            incorrectlyFormatedHazardClasses = true;
            break;
        }
        hazardClasses.push({id: Number(hazardClass)});
    }
    const parsedChemical = chemicalCreationSchema.safeParse(newChemical);
    let response: NextResponse;
    if (!parsedChemical.success || incorrectlyFormatedHazardClasses) {
        const errors = parsedChemical.error ? z.treeifyError(parsedChemical.error) : "Incorrect hazard classes";
        response = NextResponse.json(
            {
                errors: errors,
            }, { status: 400}
        );
    } else {
        
        const chemical = await prisma.chemical.create({ data: {...parsedChemical.data, hazardClass: {connect: hazardClasses}}});
        response = NextResponse.json({success: chemical}, {status: 200});
    }
    return response;

}