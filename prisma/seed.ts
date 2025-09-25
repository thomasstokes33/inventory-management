import { PrismaClient, Prisma } from "@prisma/client";


const prisma = new PrismaClient();

const sampleSuppliers: Prisma.SupplierCreateInput[] = [{
    name: "Baking Inc",
    email: "mary@backinginc.com"
},
{
    name: "Chems R Us",
    email: "jane@chemsrus.in"
}
];


const hazardClasses: Prisma.HazardClassCreateInput[] = [
    { classification: "Explosives" },
    { classification: "Gases" },
    { classification: "Flammable liquid" },
    { classification: "Flammable solids" },
    { classification: "Oxidising substances" },
    { classification: "Toxic substances" },
    { classification: "Radioactive material" },
    { classification: "Corrosive substances" },
    { classification: "Miscellaneous dangerous goods" }
];
export async function main() {
    const supplierMap: Map<string, number> = new Map();
    for (const haz of hazardClasses) {
        await prisma.hazardClass.create({ data: haz });
    }
    for (const supplier of sampleSuppliers) {
        const addedSupplier = await prisma.supplier.create({ data: supplier });
        supplierMap.set(addedSupplier.name, addedSupplier.id);
    }
    const newChemicals: Prisma.ChemicalCreateInput[] = [{
        name: "vanilla extract",
        stockQuantity: 19.8,
        quantityType: "VOLUME",
        status: "APPROVED",
        supplier: { connect: { id: supplierMap.get(sampleSuppliers[0].name) } }
    },
    {
        name: "chocolate",
        stockQuantity: 1000,
        quantityType: "MASS",
        status: "DISPENSED",
        supplier: { connect: { id: supplierMap.get(sampleSuppliers[0].name) } }
    }];
    for (const u of newChemicals) {
        await prisma.chemical.create({
            data: u
        });
    }
}

main();