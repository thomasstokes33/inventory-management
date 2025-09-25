import Image from "next/image";
import styles from "./page.module.css";
import { ChemicalRow, chemicalSchema } from "@/schemas/chemical";
import prisma from "@/lib/prisma";
import ChemicalTable from "./client/chemicalsTableClient";



export default async function Home() {
    const chemicalsRaw = await prisma.chemical.findMany({
        include: {
            supplier: true,
            location: true,
            hazardClass: true
        }
    });
    const chemicals: ChemicalRow[] = chemicalsRaw.map(chem => chemicalSchema.parse(chem));
    return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ChemicalTable initialChems={chemicals}/>
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
