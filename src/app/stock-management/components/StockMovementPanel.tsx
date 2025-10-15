"use client";

import { CostType, MovementType, Supplier } from "@prisma/client";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select, { Options } from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { SupplierRecord } from "@/schemas/supplier";
import { ChemicalRecord } from "@/schemas/chemical";
import { LocationRecord } from "@/schemas/location";
import AsyncSelect from "react-select/async";
import { API_ROUTES } from "@/lib/apiRoutes";
import { MinimalChemical } from "@/app/api/chemicals/route";
import { useFuncDebounce } from "@/app/hooks/useDebounce";
import { number } from "zod";
type StockMovementOption<T> = { label: string, value: T };
type StockMovementPanelProps =  {suppliers: SupplierRecord[]}; 
async function fetchChemicalOptions(inputChemical: string): Promise<StockMovementOption<number>[]> {  // Moved outside as no state is used.
    const res = await fetch(`${API_ROUTES.CHEMICALS}?query=${encodeURIComponent(inputChemical)}`);
    if (!res.ok) return [];
    else {
        const data = await res.json();
        const chemicals: MinimalChemical[] = data.chemicals;
        return chemicals.map(item => ({ value: item.id, label: item.name }));
    }
};
export default function StockMovementPanel({suppliers} : StockMovementPanelProps) {
    const [chem, setChem] = useState<null | StockMovementOption<ChemicalRecord>>();
    const [loc, setLoc] = useState<null | StockMovementOption<LocationRecord>>();
    const [movementType, setMovementType] = useState<null | StockMovementOption<MovementType>>();
    const [costType, setCostType] = useState<null | StockMovementOption<CostType>>();
    const [moveDate, setMoveDate] = useState<Date | null>();
    const [supplier, setSupplier] = useState<null | StockMovementOption<number>>();
    const debouncedFetch = useFuncDebounce<string, StockMovementOption<number>>(fetchChemicalOptions, 500);
    const [filteredChemicalsOptions, setFilteredChemicalsOptions] = useState<[] | StockMovementOption<number>[]>([]);
    const [filteredLocationsOptions, setFilteredLocationsOptions] = useState<[] | StockMovementOption<number>[]>([]);
    const movementTypeOptions: Options<StockMovementOption<MovementType>> = Object.values(MovementType).map(val => ({ label: val.toLocaleLowerCase(), value: val }));
    const supplierOptions: Options<StockMovementOption<number>> = suppliers.map(sup => ({value: sup.id, label: sup.name}));
    const costTypeOptions: { [K in MovementType]: StockMovementOption<CostType>[] } = {
        ISSUE: [{ value: "SELL", label: "sell" }, { value: "NONE", label: "use/discard" }],
        RECEIPT: [{ value: "PURCHASE", label: "purchase" }],
        TRANSFER: [{ value: "TRANSFER", label: "transfer" }]
    };
    const filteredCostTypeOptions = movementType ? costTypeOptions[movementType.value] : [];
    return (<div className="card">
        <div className="card-header">Goods issue/receipt</div>
        <div className="card-body">
            <form>
                <div className="d-sm-flex border">
                    <div className="flex-grow-1 p-2">
                        <label htmlFor="stock-movement-chemical">Chemical</label>
                        <AsyncSelect defaultOptions={filteredChemicalsOptions} instanceId="mat" id="stock-movement-chemical" options={filteredChemicalsOptions} loadOptions={(input: string) => debouncedFetch(input)} cacheOptions/>
                    </div>
                    <div className="flex-grow-1 p-2">
                        <label htmlFor="stock-movement-location">Location</label>
                        <AsyncSelect defaultOptions instanceId="loc" id="stock-movement-location" />
                    </div>
                </div>
                <div className="border p-2 mt-1">
                    <label htmlFor="stock-movement-movement-type">Movement type</label>
                    <Select instanceId="mov" id="stock-movement-movement-type" options={movementTypeOptions} value={movementType} onChange={setMovementType}/>
                    {movementType && <div>
                        <label htmlFor="stock-movement-cost-type">Cost Type</label>
                        {/* Cost type is limitied by the movement type. ISSUE is only purchase */}
                        <Select instanceId="cost-type" id="stock-movement-cost-type" options={filteredCostTypeOptions} value={costType} onChange={setCostType}/>
                    </div>}
                </div>
                <label htmlFor="stock-movement-supplier">Supplier</label>
                <Select instanceId="sup" id="stock-movement-supplier" options={supplierOptions} value={supplier} onChange={setSupplier}/>
                <label htmlFor="stock-movement-cost">Cost</label>
                <input className="form-control" id="stock-movement-cost"></input>
                <label htmlFor="stock-movement-quantity">Quantity</label>
                <input className="form-control" id="stock-movement-quantity"></input>
                <label htmlFor="stock-movement-date">Date</label>
                <div>
                    <DatePicker dateFormat="MMMM d, yyyy h:mm aa" showTimeSelect withPortal showIcon selected={moveDate} onChange={setMoveDate} id="stock-movement-date" />
                </div>
            </form>
        </div>
    </div>);

}