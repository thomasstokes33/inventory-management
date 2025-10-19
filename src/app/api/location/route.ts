import prisma from "@/lib/prisma";
import { locationSchema } from "@/schemas/location";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
    const formData = await request.formData();
    const newLocation: Record<string, string> = {};
    for (const pair of formData) {
        if (typeof pair[1] == "string" && pair[1].length > 0) {
            newLocation[pair[0]] = pair[1];
        } else {
            console.warn(`Skipping field: ${pair[0]}`);
        }
    }
    const res = locationSchema.safeParse(newLocation);
    let response: NextResponse;
    if (!res.success) {
        response = NextResponse.json(
            {
                errors: z.treeifyError(res.error),
               
            }, { status: 400}
        );
    } else {
        const location = await prisma.location.create({ data: res.data });
        response = NextResponse.json({data: location}, {status: 200});
    }
    return response;

}