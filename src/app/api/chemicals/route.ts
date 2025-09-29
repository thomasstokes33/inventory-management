import prisma from "@/lib/prisma";
import { chemicalSchema } from "@/schemas/chemical";
import {  NextResponse } from "next/server";
import z from "zod";

export async function GET() {
    const chemicals = await prisma.chemical.findMany();
    return NextResponse.json(chemicals);
}

const chemicalCreationSchema = chemicalSchema.pick({ name: true, quantityType: true, status: true, materialType: true, unit: true }).partial({unit:true});
export async function POST(request: Request) {
    const formData = await request.formData();
    console.log(formData);
    const newChemical: Record<string, string> = {};
    for (const pair of formData) {
        if (typeof pair[1] == "string" && pair[1].length > 0) {
            newChemical[pair[0]] = pair[1];
        } else {
            console.warn(`Skipping field: ${pair[0]}`);
        }
    }
    console.log(newChemical);
    const res = chemicalCreationSchema.safeParse(newChemical);
    let response: NextResponse;
    if (!res.success) {
        response = NextResponse.json(
            {
                errors: z.treeifyError(res.error),
               
            }, { status: 400}
        );
    } else {
        const chemical = await prisma.chemical.create({ data: res.data });
        response = NextResponse.json({success: chemical}, {status: 200});
    }
    return response;

}