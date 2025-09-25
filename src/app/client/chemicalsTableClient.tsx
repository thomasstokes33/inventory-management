"use client";
import { useState } from "react";
import { ChemicalRow } from "@/schemas/chemical";
import { chemicalTableColumns } from "./chemicalTableColumns";


export default function ChemicalTable({ initialChems } : {initialChems: ChemicalRow[]}) {
    const [chemicals, setChemicals] = useState<ChemicalRow[]>(initialChems);
    return (<table className="table">
            <thead className="table-dark">
                <tr>
                    {chemicalTableColumns.map((col) => (
                        <td key={col.field}>{col.label}</td>
                    ))

                    }
                </tr>
            </thead>
            <tbody>
                {
                    chemicals.map((chemical : ChemicalRow) => (
                        <tr key={chemical.id}>
                            {chemicalTableColumns.map(({field, format})  => (
                               <td key={field}>
                                    {format ? format(chemical) : chemical[field]?.toString()}
                                </td>
                            )    
                            )}  
                        </tr>
                    ))
                }
            </tbody>
         </table>);
}
