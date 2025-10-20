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