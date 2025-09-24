"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { Chemical } from "@prisma/client";
import { chemicalTableColumns } from "@/schemas/chemical";



export default function Home() {


    const [chemicals, setChemicals] = useState<Chemical[]>([]);
    useEffect(() => {
        async function fetchChemicals() {
            const res = await fetch("/api/chemicals");
            if (!res.ok) throw new Error("Failed to fetch chems");
            const data: Chemical[] = await res.json();
            setChemicals(data);
        }
        fetchChemicals();
    }, []);
    
    console.log(chemicals);
    return (
    <div className={styles.page}>
      <main className={styles.main}>
         <table className="table">
            <thead>
                <tr>
                    {chemicalTableColumns.map((col) => (
                        <td scope="col" key={col.field}>{col.label}</td>))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    chemicals.map( chemical => (
                        <tr key={chemical.id}>
                            <td>{chemical.name}</td>
                            <td>{chemical.stockQuantity}</td>
                            <td>{chemical.status}</td>
                            <td>{chemical.supplierId}</td>
                            <td>{chemical.locationId}</td>
                            <td>{chemical.hazardClassId}</td>
                        </tr>
                    ))
                }
            </tbody>
         </table>
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
