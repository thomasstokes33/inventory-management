"use client";
import Table, { Row, RowAction, TableColumn } from "@/app/components/Table";
import { API_ROUTES } from "@/lib/apiRoutes";
import formatLocation from "@/lib/locationFormatter";
import { toastifyFetch } from "@/lib/toastHelper";
import { StockRecord, stockSchema } from "@/schemas/stock";
import { useRouter } from "next/navigation";
import z from "zod";
type StockDeletionRow = z.infer<typeof stockSchema>;
const stockDeletionColumns: TableColumn<StockDeletionRow>[] = [
    {field: "id", label: "ID"},
    {
        field: "location",
        label: "Location", format: c => {
            return formatLocation(c.location);
        }
    },
    { field: "chemical", label: "Chemical", format: c => c.chemical.name }
];

type StockDeletionProps = { stock: StockDeletionRow[] }
export default function StockDeletion({ stock }: StockDeletionProps) {
    return (
        <div className="card">
            <div className="card-header">Existing Stock</div>
            <div className="card-body">
                <Table tableColumns={stockDeletionColumns} RowComponent={StockDeletionRow} items={stock} />
            </div>
        </div>
    );
}
type StockDeletionRowProps = { item: StockDeletionRow }
export function StockDeletionRow({ item }: StockDeletionRowProps) {
    const router = useRouter();
    const archive = async () => {
        const newItem : StockRecord= {...item, archived: true};
        toastifyFetch(`${API_ROUTES.STOCKS}/${item.id}`, {
            method: "PUT",
            body: JSON.stringify(newItem)
        }, {
            loading: "Archiving stock",
            success: "Archived stock",
            error: "Unable to archive stock"
        }, () => router.refresh(), () => {});
    };
    const archiveAction : RowAction = {isPrimary: true, showWhenEditing: true, showWhenNotEditing: true, label: "Archive", actionHandler: archive};
    return <Row actions={[archiveAction]} item={item} tableColumns={stockDeletionColumns}/>;
}