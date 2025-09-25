// import { useState } from "react";
import { ChemicalRow } from "@/schemas/chemical";
import EditableStock from "./editableStock";

type TableColumn<T, K extends keyof T = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
};
export const chemicalTableColumns: TableColumn<ChemicalRow>[] = [
    { field: "name", label: "Name" },
    {
        field: "stockQuantity", label: "Stock", format: (c: ChemicalRow) => (<EditableStock chemical={c} />)
    },
    { field: "status", label: "Status" },
    {
        field: "supplier", label: "Supplier", format: (c: ChemicalRow) => {
            return c.supplier.name;
        }
    },
    {
        field: "location", label: "Location", format: (c: ChemicalRow) => (c.location ? `${c.location.address} ${c.location.country}` : "-"
        )
    },
    {
        field: "hazardClass", label: "Hazard class", format: (c: ChemicalRow) => (
            c.hazardClass.length ? c.hazardClass.map(({ classification }) => (classification)).join(", ") : <em>No classification</em>)
    }
];

type ChemicalTableProps = {
    initialChems: ChemicalRow[]
}
export default function ChemicalTable({ initialChems }: ChemicalTableProps) {
    return (<table className="table">
        <thead className="table-dark">
            <tr>
                {chemicalTableColumns.map((col) => (
                    <td key={col.field}>{col.label}</td>
                ))}
            </tr>
        </thead>
        <tbody>
            {initialChems.map((chemical: ChemicalRow) => (
                <tr key={chemical.id}>
                    {chemicalTableColumns.map(({ field, format }) => (
                        <td key={field}>
                            {format ? format(chemical) : chemical[field]?.toString()}
                        </td>
                    )
                    )}
                </tr>
            ))}
        </tbody>
    </table>);
}
