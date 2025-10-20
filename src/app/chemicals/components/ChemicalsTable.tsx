"use client";
import Table, { Row, RowAction, TableColumn } from "@/app/components/Table";
import useDebounce from "@/app/hooks/useDebounce";
import { API_ROUTES } from "@/lib/apiRoutes";
import { formatQuantity } from "@/lib/formatter";
import { toastifyFetch } from "@/lib/toastHelper";
import { ChemicalRecordWithTotalStock } from "@/schemas/chemical";
import { MaterialType, Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ChemicalRowData = ChemicalRecordWithTotalStock;
export const chemicalTableColumns: TableColumn<ChemicalRowData>[] = [
    { field: "name", label: "Name" },
    {
        field: "status", label: "Status", formatEditable: (chemical, onChangeHandler) => {
            return (<select className="form-select" defaultValue={chemical.status} onChange={(e) => onChangeHandler(e.target.value)}>
                {Object.values(Status).map((status) =>
                    <option key={status} value={status}>{status.toLowerCase()}</option>)}
            </select>);
        },
        hideBelow: "sm"
    },
    {
        field: "hazardClass", label: "Hazard class",
        format: (c) =>
        (c.hazardClass.length ?
            c.hazardClass.map(({ classification }) => (classification)).join(", ")
            : <em>No classification</em>),
        hideBelow: "md"

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
    {
        field: "totalQuantity", label: "Quantity", format: (c) => formatQuantity(c.totalQuantity, c.quantityType, c.unit)
    }
];

type ChemicalsTableProps = { initialChems: ChemicalRowData[] }
export default function ChemicalsTable({ initialChems }: ChemicalsTableProps) {
    const [searchVal, setSearchVal] = useState<string>("");
    const debouncedVal = useDebounce<string>(searchVal, 1000);
    const items = initialChems.filter((item) => {
        return chemicalTableColumns.some(({ field }) => {
            const filterOn = item[field];
            let found = false;
            const lowerCaseFilterVal = debouncedVal.toLowerCase();
            if (filterOn == null) {  // Includes null and undefined.
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

type ChemicalRowProps = { item: ChemicalRowData};
export function ChemicalRow({ item }: ChemicalRowProps) {
    const [isEditing, setEditing] = useState<boolean>(false);
    const [chemical, setChemical] = useState(item);
    const [draft, setDraft] = useState(item);
    const router = useRouter();  // Not problematic as it returns the same object for each component until the page rerenders.
    const handleFieldChanged = <K extends keyof (typeof item)>(key: K, value: (typeof item)[K]) => {
        const newState = { ...draft, [key]: value };
        setDraft(newState);
    };
    const archive = async () => {
        const archivedChemical = { ...chemical, status: "ARCHIVED" };
        toastifyFetch(`${API_ROUTES.CHEMICALS}/${chemical.id}/archive`, {
            method: "POST",
            body: JSON.stringify(archivedChemical)
        }, {
            loading: "Archiving",
            success: "Archived",
            error: "Unable to archive"
        }, () => router.refresh(), () => {});
    };
    const editAction: RowAction = {showWhenEditing: false, showWhenNotEditing: true, isPrimary: true, label: "Edit", actionHandler: () => { setEditing(true); setDraft(chemical); }, hiddenClass: "sm" };
    const transferAction: RowAction = {showWhenEditing: false, showWhenNotEditing: true, isPrimary: true, label: "Transfer", actionHandler: () => {
        router.push(`/stock-management?chemical=${chemical.id}`);
    } };
    const archiveAction: RowAction = {showWhenEditing: false, showWhenNotEditing: true, isPrimary: true, label: "Archive", actionHandler: () => archive()};
    const saveRow = async () => {
        toastifyFetch(`${API_ROUTES.CHEMICALS}/${chemical.id}`, {
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