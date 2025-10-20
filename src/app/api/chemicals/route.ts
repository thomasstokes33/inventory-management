import { generateResponse } from "@/lib/apiRoutes";
import prisma from "@/lib/prisma";
import { ChemicalCreation, chemicalCreationSchema } from "@/schemas/chemical";
import { Chemical, Status, Synonym } from "@prisma/client";
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
    return generateResponse<Chemical[]>({data: chemicals}, 200);
}
export const VALID_CHEMICAL_GET_PARAMS= {query: "query"} as const;
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
            where: {
                status: { not: "ARCHIVED" },
                OR: [
                    { name: { contains: trimmedSearch.toLowerCase() } },
                    { status: { in: Object.values(Status).filter(status => status.toLowerCase().includes(trimmedSearch)) } },
                    { synonyms: { some: { synonym: { contains: trimmedSearch.toLowerCase() } } } }
                ]
            },
            include: { synonyms: true }
        });
        return generateResponse({ data: chemicals }, 200);
    }
}

type CreationError = string;
export async function PUT(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Incorrect format" }, { status: 400 });
    }
    const { hazardClassIds, unit, ...newChemical } = body;
    let revisedUnit = unit;
    if (!unit) revisedUnit = null;
    const { valid: parsedChemical, errors: parsingErrors } = validateChemical(newChemical);
    const { valid: formHazardClasses, errors: hazardErrors } = await validateHazardClasses(hazardClassIds);
    const errors = [...hazardErrors, ...parsingErrors];
    if (!parsedChemical || errors.length > 0) {
        console.warn({errors});
        return NextResponse.json({ errors }, { status: 400 });
    }
    const chemical = await prisma.chemical.create({ data: { ...parsedChemical, unit: revisedUnit, hazardClass: { connect: formHazardClasses } } });
    await setupSynonyms(chemical.name,chemical.id);
    return NextResponse.json({ data: chemical }, { status: 200 });
}
async function setupSynonyms(name: string, id: number) {
    const response = await fetch(`https://api.datamuse.com/words?rel_syn=${name}`);
    try {
        const words: { word: string }[] = await response.json();
        const newSynonyms: Omit<Synonym, "id">[] = words.map((w: { word: string }) => ({ chemicalId: id, synonym: w.word }));
        const newItems = await prisma.synonym.createMany({ data: newSynonyms });
        console.log(newItems);
    } catch {
        console.warn("Unexpected fetch issue");
    }
}
function validateChemical(newChemical: Record<string, string | string[]>): { valid: ChemicalCreation | null, errors: CreationError[] } {
    const validatedChemical = chemicalCreationSchema.safeParse(newChemical);
    const errors: CreationError[] = [];
    if (validatedChemical.success) return { valid: validatedChemical.data, errors: [] };
    errors.push(z.prettifyError(validatedChemical.error));
    return { valid: null, errors: errors };
}

async function validateHazardClasses(creationHazardClassIds: number[]): Promise<{ valid: { id: number }[], errors: CreationError[] }> {
    const errors: CreationError[] = [];
    const outputHazardClasses: { id: number }[] = [];
    const dbHazardClasses = await prisma.hazardClass.findMany({ select: { id: true } });
    const validIds = new Set(dbHazardClasses.map(hc => hc.id)); // use Set for fast lookup
    if (creationHazardClassIds.length > validIds.size) {
        errors.push("Too many hazard classes specified.");
        return { valid: [], errors: errors };
    }
    for (const hazardClass of creationHazardClassIds) {
        const hazardClassId = Number(hazardClass);
        if (isNaN(hazardClassId)) {
            errors.push("Invalid hazard class ID");
        } else if (!validIds.has(hazardClassId)) {
            errors.push("Invalid hazard class ID");
        } else {
            outputHazardClasses.push({ id: Number(hazardClass) });
        }
    }
    return { valid: outputHazardClasses, errors: errors };
}
