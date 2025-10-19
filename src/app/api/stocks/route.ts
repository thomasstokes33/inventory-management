import { ApiResponse, generateResponse } from "@/lib/apiRoutes";
import prisma from "@/lib/prisma";
import { stockCreationSchema } from "@/schemas/stock";
import { Prisma, Stock } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";
import { NextRequest, NextResponse } from "next/server";
function parseNumParam(input: string | null): number | undefined {
    if (!input) return undefined;
    const num = isNaN(Number(input)) ? undefined : Number(input);
    return num;
}

function parseParam(input: string | null): string | undefined {
    if (!input) return undefined;
    return input;
}

function parseDistinct(input: string | null) {
    if (!input) return undefined;
    return Boolean(input);
}

export const VALID_STOCK_GET_PARAMS = {distinctChem: "distinctChem" , distinctLoc: "distinctLoc", locId: "locationId", chemId: "chemicalId", chemicalName: "chemical", locationName: "location" } as const;
export async function GET(req: NextRequest) {
    const searchParams: URLSearchParams = req.nextUrl.searchParams; // Automatically decodes params.
    console.log(searchParams);
    const getParam = <T>(key: keyof typeof VALID_STOCK_GET_PARAMS, parser: (val: string | null) => T ) => {
        return parser(searchParams.get(VALID_STOCK_GET_PARAMS[key]));
    };
    const chemId = getParam("chemId", parseNumParam);
    const locId = getParam("locId", parseNumParam);
    const chemName = getParam("chemicalName", parseParam);
    const locName = getParam("locationName", parseParam);
    const distinctChem = getParam("distinctChem", parseDistinct);
    const distinctLoc = getParam("distinctLoc", parseDistinct);
    type StockKeys = keyof Stock;
    const distinctFields : StockKeys[] = [];
    const where: Prisma.StockWhereInput = {};
    console.log(locId);
    if (chemId !== undefined) where.chemicalId = chemId;
    if (locId !== undefined) where.locationId = locId;
    if (chemName !== undefined) where.chemical = { name: { contains: chemName } };
    if (locName !== undefined) where.location = {
        OR: [ 
            { address: { contains: locName}},
            { country: { contains: locName } },
            { code: { contains: locName } }
        ]
    };
    if (distinctChem) distinctFields.push("chemicalId");
    if (distinctLoc) distinctFields.push("locationId");
    const query: Prisma.StockFindManyArgs = {include: {chemical: true, location: true}};
    if (Object.keys(where).length !== 0 ) query.where = where;
    if (distinctFields.length > 0 ) query.distinct = distinctFields;
    const stocks = await prisma.stock.findMany(query);
    return generateResponse<Stock[]>({ data: stocks }, 200 );
}

export async function PUT(request: Request) : Promise<NextResponse<ApiResponse<Stock>>> {
    let data;
    try {
        data = await request.json();
    } catch {
        return generateResponse<Stock>({ error: "Incorrect format" }, 400 );
    }
    const validatedStock = stockCreationSchema.safeParse(data);
    if (validatedStock.error) return generateResponse<Stock>({ error: "Invalid types" }, 400);
    let stock : Stock;
    try {
        stock = await prisma.stock.create({
            data: {
                location: { connect: { id: validatedStock.data.locationId } },
                chemical: { connect: { id: validatedStock.data.chemicalId } },
                stockQuantity: 0
            }
        });
        return generateResponse<Stock>({ data: stock }, 200);
    } catch (err) {
        console.log((err as PrismaClientKnownRequestError).message);
        return generateResponse<Stock>({error: "Invalid ID combination"}, 400);
    }
}