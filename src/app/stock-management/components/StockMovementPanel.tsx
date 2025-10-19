"use client";

import { CostType, MovementType } from "@prisma/client";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select, { Options } from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { SupplierRecord } from "@/schemas/supplier";
import { ChemicalRecord } from "@/schemas/chemical";
import { LocationRecord } from "@/schemas/location";
import AsyncSelect from "react-select/async";
import { API_ROUTES } from "@/lib/apiRoutes";
import { useFuncDebounce } from "@/app/hooks/useDebounce";
import { VALID_STOCK_GET_PARAMS } from "@/app/api/stocks/route";
import { StockRecord } from "@/schemas/stock";
import { MinimalChemical } from "@/app/api/chemicals/route";
import { formatLocation } from "@/lib/formatter";
import { StockMovementNonNested } from "@/schemas/stockMovement";
import { toastifyFetch } from "@/lib/toastHelper";
import { useRouter } from "next/navigation";
type StockMovementOption<T> = T extends { id: number } ? { label: string, value: T["id"] } : { label: string, value: T };
type StockMovementPanelProps = { suppliers: SupplierRecord[], stockCount: number };

async function fetchStocks(searchParams: URLSearchParams) {
    const res = await fetch(`${API_ROUTES.STOCKS}?${searchParams.toString()}`);
    if (!res.ok) return [];
    const { data: stocks }: { data: StockRecord[] } = await res.json();
    return stocks;
}
function parseParam(id?: number) {
    if (!id || isNaN(Number(id))) {
        return "";
    } else {
        return String(id);
    }
}

async function fetchLocationFilteredChemicalOptions(inputLocation?: StockMovementOption<LocationRecord> | null): Promise<StockMovementOption<MinimalChemical>[]> {  // Moved outside as no state is used.
    const parsedLocationId = parseParam(inputLocation?.value);
    const params = new URLSearchParams();
    params.set(VALID_STOCK_GET_PARAMS.locId, parsedLocationId);
    params.set(VALID_STOCK_GET_PARAMS.distinctChem, String(true));
    const stocks = await fetchStocks(params);
    console.log(stocks);
    return stocks.map(s => ({ value: s.chemicalId, label: s.chemical.name }));
};

async function fetchChemicalFilteredLocationOptions(inputChemical?: StockMovementOption<MinimalChemical> | null): Promise<StockMovementOption<LocationRecord>[]> {
    const parsedChemId = parseParam(inputChemical?.value);
    const params = new URLSearchParams();
    params.set(VALID_STOCK_GET_PARAMS.chemId, parsedChemId);
    params.set(VALID_STOCK_GET_PARAMS.distinctLoc, String(true));
    const stocks = await fetchStocks(params);
    return stocks.map(s => ({ value: s.locationId, label: formatLocation(s.location) }));
}
async function fetchPermittedChemicalsOptions(inputChem: string): Promise<StockMovementOption<MinimalChemical>[]> {
    const params = new URLSearchParams();
    params.set(VALID_STOCK_GET_PARAMS.chemicalName, inputChem);
    params.set(VALID_STOCK_GET_PARAMS.distinctChem, String(true));
    const stocks = await fetchStocks(params);
    return stocks.map(s => ({ value: s.id, label: s.chemical.name })); // uses stock id.
}

async function fetchPermittedLocationOptions(inputLocation: string): Promise<StockMovementOption<LocationRecord>[]> {
    const params = new URLSearchParams();
    params.set(VALID_STOCK_GET_PARAMS.locationName, inputLocation);
    params.set(VALID_STOCK_GET_PARAMS.distinctLoc, String(true));
    const stocks = await fetchStocks(params);
    return stocks.map(s => ({ value: s.id, label: formatLocation(s.location) }));
}

const movementTypeOptions: Options<StockMovementOption<MovementType>> = Object.values(MovementType).map(val => ({ label: val.toLocaleLowerCase(), value: val }));
const costTypeOptions: { [K in MovementType]: StockMovementOption<CostType>[] } = {
    ISSUE: [{ value: "SELL", label: "sell" }],
    RECEIPT: [{ value: "PURCHASE", label: "purchase" }],
    TRANSFER_IN: [{ value: "TRANSFER", label: "N/A" }],
    TRANSFER_OUT: [{ value: "TRANSFER", label: "transfer out" }],
    DISCARD: [{ value: "NONE", label: "N/A" }],
    RETURN: [{ value: "NONE", label: "N/A" }, { value: "TRANSFER", label: "Return cost" }],
    PRODUCTION_OUTPUT: [{ value: "PRODUCE", label: "production" }],
    PRODUCTION_USE: [{ value: "NONE", label: "N/A" }]

};
export default function StockMovementPanel({ suppliers, stockCount }: StockMovementPanelProps) {
    const [chem, setChem] = useState<null | StockMovementOption<ChemicalRecord>>(null);
    const [loc, setLoc] = useState<null | StockMovementOption<LocationRecord>>(null);
    const [movementType, setMovementType] = useState<null | StockMovementOption<MovementType>>(null);
    const [costType, setCostType] = useState<null | StockMovementOption<CostType>>(null);
    const [moveDate, setMoveDate] = useState<Date | null>(null);
    const [supplier, setSupplier] = useState<null | StockMovementOption<SupplierRecord>>(null);
    const debouncedFetchChemicals = useFuncDebounce<string, StockMovementOption<MinimalChemical>>(fetchPermittedChemicalsOptions, 500);
    const debouncedFetchLocations = useFuncDebounce<string, StockMovementOption<LocationRecord>>(fetchPermittedLocationOptions, 500);
    const [filteredChemicalsOptions, setFilteredChemicalsOptions] = useState<null | StockMovementOption<MinimalChemical>[]>(null);
    const [filteredLocationsOptions, setFilteredLocationsOptions] = useState<null | StockMovementOption<LocationRecord>[]>(null);
    const filteredCostTypeOptions = movementType ? costTypeOptions[movementType.value] : [];
    const supplierOptions: Options<StockMovementOption<SupplierRecord>> = suppliers.map(sup => ({ value: sup.id, label: sup.name }));
    const reset = async () => {
        setChem(null);
        setLoc(null);
        setMovementType(null);
        setSupplier(null);
        setMoveDate(null);
        fetchPermittedLocationOptions("").then(setFilteredLocationsOptions);
        fetchPermittedChemicalsOptions("").then(setFilteredChemicalsOptions); // If there are no options, get all chemicals in the stock table.
    };
    useEffect(() => {
        fetchPermittedChemicalsOptions("").then(setFilteredChemicalsOptions); // If there are no options, get all chemicals in the stock table.
    }, [stockCount]);
    useEffect(() => {
        fetchPermittedLocationOptions("").then(setFilteredLocationsOptions);
    }, [stockCount]);
    const handleLocChange = (newLoc: StockMovementOption<LocationRecord> | null) => {
        setLoc(newLoc);
        if (!newLoc || !filteredLocationsOptions?.includes(newLoc)) setChem(null);
        fetchLocationFilteredChemicalOptions(newLoc).then((ops) => { console.log("loc filtered", ops); setFilteredChemicalsOptions(ops); }); // Otherwise, get all chemicals that match the given location.
    };
    const handleChemChange = (newChem: StockMovementOption<MinimalChemical> | null) => {
        setChem(newChem);
        if (!newChem || !filteredChemicalsOptions?.includes(newChem)) setLoc(null);
        fetchChemicalFilteredLocationOptions(newChem).then(ops => { console.log(ops); setFilteredLocationsOptions(ops); });
    };
    const handleMovementTypeChange = (newMovType: StockMovementOption<MovementType> | null) => {
        setMovementType(newMovType);
        if (newMovType?.value) {
            setCostType(costTypeOptions[newMovType.value][0]);
        }
    };
    return (<div className="card">
        <div className="card-header">Goods issue/receipt</div>
        <div className="card-body">
            <form>
                <div className="d-sm-flex border">
                    <div className="flex-grow-1 p-2">
                        <label htmlFor="stock-movement-chemical">Chemical</label>
                        <AsyncSelect instanceId="mat" id="stock-movement-chemical"
                            isLoading={!filteredChemicalsOptions}
                            defaultOptions={filteredChemicalsOptions ?? []}
                            isClearable
                            value={chem}
                            cacheOptions
                            loadOptions={v => debouncedFetchChemicals(v)}
                            onChange={handleChemChange} />
                    </div>
                    <div className="flex-grow-1 p-2">
                        <label htmlFor="stock-movement-location">Location</label>
                        <AsyncSelect instanceId="loc" id="stock-movement-location"
                            isLoading={!filteredLocationsOptions}
                            defaultOptions={filteredLocationsOptions ?? []}
                            isClearable
                            value={loc}
                            loadOptions={v => debouncedFetchLocations(v)}
                            cacheOptions
                            onChange={handleLocChange} />
                    </div>
                </div>
                <div className="border p-2 mt-1">
                    <label htmlFor="stock-movement-movement-type">Movement type</label>
                    <Select instanceId="mov" id="stock-movement-movement-type" options={movementTypeOptions} value={movementType} onChange={handleMovementTypeChange} />
                    {movementType && <div>
                        <label htmlFor="stock-movement-cost-type">Cost Type</label>
                        {/* Cost type is limitied by the movement type. ISSUE is only purchase */}
                        <Select instanceId="cost-type" id="stock-movement-cost-type" options={filteredCostTypeOptions} value={costType} onChange={setCostType} />
                    </div>}
                </div>
                <label htmlFor="stock-movement-supplier">Supplier</label>
                <Select instanceId="sup" id="stock-movement-supplier" options={supplierOptions} value={supplier} onChange={setSupplier} />
                <label htmlFor="stock-movement-cost">Cost</label>
                <input className="form-control" id="stock-movement-cost" name="cost"></input>
                <label htmlFor="stock-movement-quantity">Quantity</label>
                <input className="form-control" id="stock-movement-quantity" name="quantity"></input>
                <label htmlFor="stock-movement-date">Date</label>
                <DatePicker className="w-100" isClearable dateFormat="MMMM d, yyyy h:mm aa" showTimeSelect withPortal showIcon selected={moveDate} onChange={setMoveDate} id="stock-movement-date" />
                <div className="btn-group mt-2">
                    <button className="btn btn-primary" type="submit">Submit</button>
                    <button className="btn btn-secondar" type="reset" onClick={reset}>Reset</button>
                </div>
            </form>
        </div>
    </div>);

}