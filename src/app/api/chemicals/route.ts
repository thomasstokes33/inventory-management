import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const chemicals = await prisma.chemical.findMany();
    return NextResponse.json(chemicals);
}