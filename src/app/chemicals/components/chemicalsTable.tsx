"use client";
import Table, { Row, RowAction } from "@/app/components/table";
import useDebounce from "@/app/hooks/useDebounce";
import { toastifyFetch } from "@/lib/toastHelper";
import { ChemicalRecord } from "@/schemas/chemical";
import { MaterialType, Status } from "@prisma/client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useState } from "react";

type HideBelowOptions = "sm" | "md" | "lg" | "xl"
type TableColumn<T, K extends keyof T = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
    formatEditable?: (value: T, onChangeHandler: (value: string) => void) => React.ReactNode;
    hideBelow?: HideBelowOptions;
};
export const chemicalTableColumns: TableColumn<ChemicalRecord>[] = [
    { field: "name", label: "Name" },
    {
        field: "status", label: "Status", formatEditable: (chemical, onChangeHandler) => {
            return (<select className="form-select" defaultValue={chemical.status} onChange={(e) => onChangeHandler(e.target.value)}>
                {Object.values(Status).map((status) =>
                    <option key={status} value={status}>{status.toLowerCase()}</option>)}
            </select>);
        },
    },
    {
        field: "hazardClass", label: "Hazard class",
        format: (c: ChemicalRecord) =>
        (c.hazardClass.length ?
            c.hazardClass.map(({ classification }) => (classification)).join(", ")
            : <em>No classification</em>),
        hideBelow: "sm"

    },
    {
        field: "materialType", label: "Material Type", formatEditable: (chemical, onChangeHandler) => {
            return (<select className="form-select" defaultValue={chemical.materialType} onChange={(e) => onChangeHandler(e.target.value)}>
                {Object.values(MaterialType).map((materialType) =>
                    <option key={materialType} value={materialType}>{materialType.toLowerCase()}</option>)}
            </select>);
        },
        hideBelow: "sm"
    },
];




type ChemicalsTableProps = { initialChems: ChemicalRecord[] }
export default function ChemicalsTable({ initialChems }: ChemicalsTableProps) {
    const [searchVal, setSearchVal] = useState<string>("");
    const debouncedVal = useDebounce<string>(searchVal, 1000);
    const items = initialChems.filter((item) => {
        return chemicalTableColumns.some(({ field }) => {
            const filterOn = item[field];
            let found = false;
            const lowerCaseFilterVal = debouncedVal.toLowerCase();
            if (!filterOn) {
                found = false;
            } else if (Array.isArray(filterOn)) {
                found = filterOn.some((val) => val.classification.toLowerCase().includes(lowerCaseFilterVal));
            } else {
                found = String(filterOn).toLowerCase().includes(lowerCaseFilterVal);
            }
            return found;
        });
    });
    return (
        <div className="container-xxl">
            <div className="input-group">
                <input className="form-control" placeholder="Search" onChange={(e) => setSearchVal(e.target.value)} />
            </div>
            <Table RowComponent={ChemicalRow} tableColumns={chemicalTableColumns} items={items} />
        </div>
    );
}


type ChemicalRowProps = { item: ChemicalRecord, router: AppRouterInstance };
export function ChemicalRow({ item, router }: ChemicalRowProps) {
    const [isEditing, setEditing] = useState<boolean>(false);
    const [chemical, setChemical] = useState(item);
    const [draft, setDraft] = useState(item);
    const handleFieldChanged = <K extends keyof ChemicalRecord>(key: K, value: ChemicalRecord[K]) => {
        const newState = { ...draft, [key]: value };
        setDraft(newState);
    };
    const archive = async () => {
        const archivedChemical = { ...chemical, status: "ARCHIVED" };
        toastifyFetch(`/api/chemicals/${chemical.id}`, {
            method: "POST",
            body: JSON.stringify(archivedChemical)
        }, {
            loading: "Archiving",
            success: "Archived",
            error: "Unable to archive"
        }, () => router.refresh(), () => {});
    };
    const editAction: RowAction = {showWhenEditing: false, showWhenNotEditing: true, isPrimary: true, label: "Edit", actionHandler: () => { setEditing(true); setDraft(chemical); }, hiddenClass: "sm" };
    const transferAction: RowAction = {showWhenEditing: false, showWhenNotEditing: true, isPrimary: true, label: "Transfer" };
    const archiveAction: RowAction = {showWhenEditing: false, showWhenNotEditing: true, isPrimary: true, label: "Archive", actionHandler: () => archive()};
    const saveRow = async () => {
        toastifyFetch(`/api/chemicals/${chemical.id}`, {
            method: "POST",
            body: JSON.stringify(draft)
        },
            {
                loading: "Saving",
                success: "Updated",
                error: "Unable to update"
            },
            () => {
                setChemical(draft);
                setDraft(draft);
                router.refresh();
            }, () => {
                setDraft(chemical);
            });
        setEditing(false);
    };
    const saveRowAction: RowAction = { isPrimary: true, showWhenEditing: true, showWhenNotEditing: false, label: "Save", actionHandler: saveRow };
    const cancelSaveRowAction: RowAction = { isPrimary: false, showWhenEditing: true, showWhenNotEditing: false, label: "Cancel", actionHandler: () => { setDraft(chemical); setEditing(false); } };
    const actions = [editAction, transferAction, archiveAction, saveRowAction, cancelSaveRowAction];
    return (<Row actions={actions} item={chemical} tableColumns={chemicalTableColumns} isEditing={isEditing} onChange={handleFieldChanged} />);
}