import prisma from "@/lib/prisma";
import { stockCreationSchema } from "@/schemas/stock";
import { Stock } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";
import { NextResponse } from "next/server";

export async function GET() {
    const stocks = await prisma.stock.findMany();
    return NextResponse.json({ data: stocks }, { status: 200 });
}

export async function PUT(request: Request) {
    let data;
    try {
        data = await request.json();
    } catch {
        return NextResponse.json({ error: "Incorrect format" }, { status: 400 });
    }
    const validatedStock = stockCreationSchema.safeParse(data);
    if (validatedStock.error) return NextResponse.json({ error: "Invalid types" }, { status: 400 });
    let stock : Stock;
    try {
        stock = await prisma.stock.create({
            data: {
                location: { connect: { id: validatedStock.data.locationId } },
                chemical: { connect: { id: validatedStock.data.chemicalId } },
                stockQuantity: 0
            }
        });
        return NextResponse.json({ data: stock }, { status: 200 });
    } catch (err) {
        console.log((err as PrismaClientKnownRequestError).message);
        return NextResponse.json({error: "Invalid ID combination"}, {status: 400});
    }
}