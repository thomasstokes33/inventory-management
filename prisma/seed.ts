import { PrismaClient, Prisma } from "@prisma/client";


const prisma = new PrismaClient();

const sampleSupplier: Prisma.SupplierCreateInput = {
    name: "Baking Inc",
    email: "mary@backinginc.com"
};

export async function main() {
    const newSupplier: {
        name: string;
        email: string;
        id: number;
    } = await prisma.supplier.create({ data: sampleSupplier });

    const newChemicals: Prisma.ChemicalCreateInput[] = [{
        name: "vanilla extract",
        stock_quantity: 19.8,
        unit: "ml",
        status: "APPROVED",
        supplier: { connect: { id: newSupplier.id } }
    }];
    for (const u of newChemicals) {
        await prisma.chemical.create({
            data: u
        });
    }
}

main();