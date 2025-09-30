"use client";
import { ChemicalRecord } from "@/schemas/chemical";
import { MaterialType, Status } from "@prisma/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
type TableColumn<T, K extends keyof T = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
    formatEditable?: (value: T, onChangeHandler: (value: string) => void) => React.ReactNode;
};
export const chemicalTableColumns: TableColumn<ChemicalRecord>[] = [
    { field: "name", label: "Name" },
    {
        field: "status", label: "Status", formatEditable: (chemical, onChangeHandler) => {
            return (<select className="form-select" defaultValue={chemical.status} onChange={(e) => onChangeHandler(e.target.value)}>
                {Object.values(Status).map((status) =>
                    <option key={status} value={status}>{status.toLowerCase()}</option>)}
            </select>);
        }
    },
    {
        field: "hazardClass", label: "Hazard class",
        format: (c: ChemicalRecord) =>
        (c.hazardClass.length ?
            c.hazardClass.map(({ classification }) => (classification)).join(", ")
            : <em>No classification</em>),

    },
    {
        field: "materialType", label: "Material Type", formatEditable: (chemical, onChangeHandler) => {
            return (<select className="form-select" defaultValue={chemical.status} onChange={(e) => onChangeHandler(e.target.value)}>
                {Object.values(MaterialType).map((materialType) =>
                    <option key={materialType} value={materialType}>{materialType.toLowerCase()}</option>)}
            </select>);
        }
    },
];

type ChemicalsTableProps = { initialChems: ChemicalRecord[] }
export default function ChemicalsTable({ initialChems }: ChemicalsTableProps) {
    const [searchVal, setSearchVal] = useState<string>("");
    const router = useRouter();
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
                            <ChemicalRow router={router} key={chemical.id} initialChemical={chemical} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

enum UpdateStatusVals { SUCCESS, ERROR, IDLE }
type ChemicalRowProps = { initialChemical: ChemicalRecord, router : AppRouterInstance }
export function ChemicalRow({ initialChemical, router }: ChemicalRowProps) {
    const [isEditing, setEditing] = useState<boolean>(false);
    const [chemical, setChemical] = useState(initialChemical);
    const [draft, setDraft] = useState(initialChemical);
    const [updateStatus, setUpdateStatus] = useState<UpdateStatusVals>(UpdateStatusVals.IDLE);
    const handleFieldChanged = <K extends keyof ChemicalRecord>(key: K, value: ChemicalRecord[K]) => {
        const newState = { ...draft, [key]: value };
        console.log(newState);
        setDraft(newState);
    };
    const archive = async () => {
        const archivedChemical = { ...chemical, status: "ARCHIVED" };
        await fetch(`/api/chemicals/${chemical.id}`, {
            method: "POST",
            body: JSON.stringify(archivedChemical)
        });
        router.refresh();
    };
    const saveRow = async () => {
        const res = await fetch(`/api/chemicals/${chemical.id}`,
            {
                method: "POST",
                body: JSON.stringify(draft)
            }
        );
        if (res.ok) {
            setChemical(draft);
            setDraft(draft);
            setUpdateStatus(UpdateStatusVals.SUCCESS);
        } else {
            setUpdateStatus(UpdateStatusVals.ERROR);
        }
        setTimeout(() => {
            setUpdateStatus(UpdateStatusVals.IDLE);
        }, 1000);
        setEditing(false);
        router.refresh();
    };
    const renderStatusIcon = () => {
        return (
            <span>{updateStatus === UpdateStatusVals.SUCCESS
                ? "✅"
                : updateStatus === UpdateStatusVals.ERROR
                    ? "❌"
                    : null}</span>
        );
    };
    return (<tr>
        {chemicalTableColumns.map(({ field, format, formatEditable }) => (
            <td key={field}>
                {isEditing && formatEditable
                    ? formatEditable(chemical, (value) => handleFieldChanged(field, value))
                    : format
                        ? format(chemical)
                        : chemical[field]?.toString()
                }
            </td>
        ))
        }
        <td>
            {
                isEditing ? (
                    <div className="btn-group" role="group">
                        <button className="btn btn-outline-primary" onClick={saveRow}>Save</button>
                        <button className="btn btn-outline-secondary" onClick={() => {setDraft(chemical); setEditing(false);}}>Cancel</button>
                    </div>
                ) : (
                    <div className="btn-group" role="group">
                        <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>Edit</button>
                        <button className="btn btn-outline-primary">Transfer</button>
                        <button className="btn btn-outline-primary" onClick={archive}>Archive</button>
                    </div>
                )
            }
            {renderStatusIcon()}
        </td>

    </tr>);
}