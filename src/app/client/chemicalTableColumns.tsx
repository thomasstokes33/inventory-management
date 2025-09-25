import { ChemicalRow } from "@/schemas/chemical";


type TableColumn<T, K extends keyof T = keyof T> = {
    field: K;
    label: string;
    format?: (value: T) => React.ReactNode;
};
export const chemicalTableColumns: TableColumn<ChemicalRow>[] = [
    { field: "name", label: "Name" },
    {
        field: "stockQuantity", label: "Stock", format: (c: ChemicalRow) => {
            let displayVal;
            switch (c.quantityType) {
                case "MASS":
                    displayVal = `${c.stockQuantity} ${c.unit ?? ""}`;
                    break;
                case "MASS":
                    displayVal = `${c.stockQuantity} g`;
                    break;
                case "VOLUME":
                    displayVal = `${c.stockQuantity} ml`;
                    break;
                default:
                    displayVal = "";
                    break;
            }
            return displayVal;
        }
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
