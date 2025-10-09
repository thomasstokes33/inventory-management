import Image from "next/image";
import styles from "./page.module.css";
import { ChemicalRecord, chemicalSchema } from "@/schemas/chemical";
import prisma from "@/lib/prisma";
import CountCard from "./components/CountCard";
import StatsCard from "./components/StatsCard";



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
            <footer className={styles.footer}>
                <a
                    href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/file.svg"
                        alt="File icon"
                        width={16}
                        height={16}
                    />
                    Learn
                </a>
                <a
                    href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/window.svg"
                        alt="Window icon"
                        width={16}
                        height={16}
                    />
                    Examples
                </a>
                <a
                    href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        aria-hidden
                        src="/globe.svg"
                        alt="Globe icon"
                        width={16}
                        height={16}
                    />
                    Go to nextjs.org →
                </a>
            </footer>
        </div>
    );
}
