import styles from "./page.module.css";
import { ChemicalRecord, chemicalSchema } from "@/schemas/chemical";
import prisma from "@/lib/prisma";
import CountCard from "./components/CountCard";
import StatsCard from "./components/StatsCard";

export const revalidate = 30;


export default async function Home() {
    // Lastest created chemicals
    const daysOfCreatedChemicals = 5;
    const date = new Date();
    date.setDate(date.getDay() - daysOfCreatedChemicals);
    const chemicalsRecentRaw = await prisma.chemical.findMany({
        include: {
            hazardClass: true
        },
        where: {
            updatedAt: { gte: date }
        }
    });
    const chemicalsRecent: ChemicalRecord[] = chemicalsRecentRaw.map(chem => chemicalSchema.parse(chem));
    const chemicalsCount = await prisma.chemical.count();
    const supplierCount = await prisma.supplier.count();
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className="row">
                    <div className="col-sm-6">
                        <CountCard title="Total Chemicals" count={chemicalsCount} />
                    </div>
                    <div className="col-sm-6">
                        <CountCard title="Total Suppliers" count={supplierCount} />
                    </div>
                </div>
                <StatsCard<ChemicalRecord> title={`Latest Chemicals (${daysOfCreatedChemicals} days)`} items={chemicalsRecent} renderItem={item => {
                    return `${item.name} - ${item.status} - ${item.updatedAt.toLocaleDateString()}`;
                }
                } />
            </main>
        </div>
    );
}
