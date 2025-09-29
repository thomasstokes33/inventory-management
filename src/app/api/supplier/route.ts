import prisma from "@/lib/prisma";
import { supplierSchema } from "@/schemas/supplier";
import { NextResponse } from "next/server";
import z from "zod";

export async function POST(request: Request) {
    const formData = await request.formData();
    const newSupplier: Record<string, string> = {};
    for (const pair of formData) {
        if (typeof pair[1] == "string" && pair[1].length > 0) {
            newSupplier[pair[0]] = pair[1];
        } else {
            console.warn(`Skipping field: ${pair[0]}`);
        }
    }
    const res = supplierSchema.safeParse(newSupplier);
    let response: NextResponse;
    if (!res.success) {
        response = NextResponse.json(
            {
                errors: z.treeifyError(res.error),
               
            }, { status: 400}
        );
    } else {
        const supplier = await prisma.supplier.create({ data: res.data });
        response = NextResponse.json({success: supplier}, {status: 200});
    }
    return response;

}