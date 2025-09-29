"use client";
import { ChemicalRecord } from "@/schemas/chemical";
import { useState } from "react";

type TableColumn<T, K extends keyof T = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
};
export const chemicalTableColumns: TableColumn<ChemicalRecord>[] = [
    { field: "name", label: "Name" },
    { field: "status", label: "Status" },
    {
        field: "hazardClass", label: "Hazard class", format: (c: ChemicalRecord) => (

            c.hazardClass.length ? c.hazardClass.map(({ classification }) => (classification)).join(", ") : <em>No classification</em>)
    },
    { field: "materialType", label: "Material Type", },
];

type ChemicalsTableProps = { initialChems: ChemicalRecord[] }
export default function ChemicalsTable({ initialChems }: ChemicalsTableProps) {
    const [searchVal, setSearchVal] = useState<string>("");
    return (
        <div className="container-xxl">
            <div className="input-group">
                <input className="form-control" placeholder="Search" onChange={(e) => setSearchVal(e.target.value)}/>
            </div>
            <div className="table-responsive">
                <table className="table">
                    <thead className="table-dark">
                        <tr>
                            {chemicalTableColumns.map((col) => (
                                <td key={col.field}>{col.label}</td>
                            ))}
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {initialChems.filter((chemical) => (chemical.name.toLowerCase().includes(searchVal))).map((chemical: ChemicalRecord) => (
                            <ChemicalRow key={chemical.id} chemical={chemical} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


type ChemicalRowProps = { chemical: ChemicalRecord }
export function ChemicalRow({ chemical }: ChemicalRowProps) {
    const [isEditing, setEditing] = useState<boolean>(false);
    const [state, setState] = useState(chemical);
    async function saveRow() {
        setEditing(false);
    }
    return (<tr>
        {chemicalTableColumns.map(({ field, format }) => (
            <td key={field}>
                {format ? format(chemical) : chemical[field]?.toString()}
            </td>
        ))
        }
        <td>
            {
                isEditing ? (
                    <div className="btn-group" role="group">
                        <button className="btn btn-outline-primary" onMouseUp={saveRow}>Save</button>
                        <button className="btn btn-outline-primary" onMouseUp={() => setEditing(false)}>Cancel</button>
                    </div>
                ) : (
                    <div className="btn-group" role="group">
                        <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>Edit</button>
                        <button className="btn btn-outline-primary">Transfer</button>
                    </div>
                )
            }
        </td>

    </tr>);
}