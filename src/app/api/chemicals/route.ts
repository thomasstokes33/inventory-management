import prisma from "@/lib/prisma";
import { chemicalSchema } from "@/schemas/chemical";
import { Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const MAX_QUERY_LENGTH = 15;
const MAX_CHEMICALS_RETURNED = 30;
export type MinimalChemical = {
    name: string;
    id: number;
};


async function getInitialChemicalsResponse() {
    const chemicals = await prisma.chemical.findMany({ where: { status: { not: "ARCHIVED" } }, take: MAX_CHEMICALS_RETURNED });
    return NextResponse.json({ chemicals: chemicals }, { status: 200 });
}

export async function GET(request: NextRequest) {
    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    console.log(searchParams);
    if (searchParams.size == 0) {
        return getInitialChemicalsResponse();
    } else {
        const query = searchParams.get("query");
        if (typeof query !== "string" || query.length > MAX_QUERY_LENGTH) {
            return NextResponse.json({ error: "invalid query" }, { status: 400 });
        }
        if (query.trim().length === 0) {
            return getInitialChemicalsResponse();
        }
        const trimmedSearch = query.trim();
        const chemicals = await prisma.chemical.findMany({
            take: MAX_CHEMICALS_RETURNED,
            select: { id: true, name: true },
            where: {
                status: { not: "ARCHIVED" },
                OR: [{ name: { contains: trimmedSearch.toLowerCase() } },
                { status: { in: Object.values(Status).filter(status => status.toLowerCase().includes(trimmedSearch)) } }
                ]
            }
        });
        return NextResponse.json({ chemicals: chemicals }, { status: 200 });
    }
}


type FormError = string;
const chemicalCreationSchema = chemicalSchema.pick({ name: true, quantityType: true, status: true, materialType: true, unit: true }).partial({ unit: true });
type ChemicalCreation = z.infer<typeof chemicalCreationSchema>;
export async function PUT(request: Request) {
    let formData : FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ error: "Incorrect format" }, { status: 400 });
    }
    const newChemical: Record<string, string | string[]> = parseFormData(formData);
    const formHazardClassIds = formData.getAll("hazardClass");  // Each item is a hazard class ID number.
    const { valid: formHazardClasses, errors: hazardErrors } = await validateHazardClasses(formHazardClassIds);
    const { valid: parsedChemical, errors: parsingErrors } = validateChemical(newChemical);
    const errors = [...hazardErrors, ...parsingErrors];
    if (!parsedChemical || errors.length > 0) {
        console.warn({errors});
        return NextResponse.json({ errors }, { status: 400 });
    }
    const chemical = await prisma.chemical.create({ data: { ...parsedChemical, hazardClass: { connect: formHazardClasses } } });
    return NextResponse.json({ chemical: chemical }, { status: 200 });
}

function validateChemical(newChemical: Record<string, string | string[]>): { valid: ChemicalCreation | null, errors: FormError[] } {
    const validatedChemical = chemicalCreationSchema.safeParse(newChemical);
    const errors: FormError[] = [];
    if (validatedChemical.success) return { valid: validatedChemical.data, errors: [] };
    errors.push(z.prettifyError(validatedChemical.error));
    return { valid: null, errors: errors };
}

async function validateHazardClasses(formHazardClassIds: FormDataEntryValue[]): Promise<{ valid: { id: number }[], errors: FormError[] }> {
    const errors: FormError[] = [];
    const formHazardClasses: { id: number }[] = [];
    const dbHazardClasses = await prisma.hazardClass.findMany({ select: { id: true } });
    const validIds = new Set(dbHazardClasses.map(hc => hc.id)); // use Set for fast lookup
    if (formHazardClassIds.length > validIds.size) {
        errors.push("Too many hazard classes specificed.");
        return { valid: [], errors: errors };
    }
    for (const hazardClass of formHazardClassIds) {
        const hazardClassId = Number(hazardClass);
        if (isNaN(hazardClassId)) {
            errors.push("Invalid hazard class ID");
        } else if (!validIds.has(hazardClassId)) {
            errors.push("Invalid hazard class ID");
        } else {
            formHazardClasses.push({ id: Number(hazardClass) });
        }
    }
    return { valid: formHazardClasses, errors: errors };
}

function parseFormData(formData: FormData): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    for (const pair of formData) {
        if (typeof pair[1] == "string" && pair[1].length > 0) {
            result[pair[0]] = pair[1];
        } else {
            console.warn(`Skipping field: ${pair[0]}`);
        }
    }
    return result;
}