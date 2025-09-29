import { ChemicalRow } from "@/schemas/chemical";

type TableColumn<T, K extends keyof T = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
};
export const chemicalTableColumns: TableColumn<ChemicalRow>[] = [
    { field: "name", label: "Name" },
    { field: "status", label: "Status" },
    {
        field: "hazardClass", label: "Hazard class", format: (c: ChemicalRow) => (
            c.hazardClass.length ? c.hazardClass.map(({ classification }) => (classification)).join(", ") : <em>No classification</em>)
    },
    {field: "materialType" , label: "Material Type"}
];

type ChemicalsTableProps = { initialChems: ChemicalRow[] }
export default function ChemicalsTable({ initialChems }: ChemicalsTableProps) {
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