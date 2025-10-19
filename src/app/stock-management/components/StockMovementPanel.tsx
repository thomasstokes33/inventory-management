"use client";

import { CostType, MovementType } from "@prisma/client";
import { FormEvent, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select, { Options } from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { SupplierRecord } from "@/schemas/supplier";
import { ChemicalRecord } from "@/schemas/chemical";
import { LocationRecord } from "@/schemas/location";
import AsyncSelect from "react-select/async";
import { API_ROUTES, ApiResponse } from "@/lib/apiRoutes";
import { useFuncDebounce } from "@/app/hooks/useDebounce";
import { VALID_STOCK_GET_PARAMS } from "@/app/api/stocks/route";
import { StockRecord } from "@/schemas/stock";
import { MinimalChemical } from "@/app/api/chemicals/route";
import { formatLocation } from "@/lib/formatter";
import { StockMovementCreationSchema, StockMovementNonNested } from "@/schemas/stockMovement";
import { toastifyFetch } from "@/lib/toastHelper";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
    return stocks.map(s => ({ value: s.chemicalId, label: s.chemical.name })); // uses stock id.
}

async function fetchPermittedLocationOptions(inputLocation: string): Promise<StockMovementOption<LocationRecord>[]> {
    const params = new URLSearchParams();
    params.set(VALID_STOCK_GET_PARAMS.locationName, inputLocation);
    params.set(VALID_STOCK_GET_PARAMS.distinctLoc, String(true));
    const stocks = await fetchStocks(params);
    return stocks.map(s => ({ value: s.locationId, label: formatLocation(s.location) }));
}

const movementTypeOptions: Options<StockMovementOption<MovementType>> = Object.values(MovementType).map(val => ({ label: val.toLocaleLowerCase(), value: val }));
const costTypeOptions: { [K in MovementType]: StockMovementOption<CostType>[] } = {
    ISSUE: [{ value: "SELL", label: "sell" }],
    RECEIPT: [{ value: "PURCHASE", label: "purchase" }],
    TRANSFER_IN: [{ value: "TRANSFER", label: "N/A" }],
    TRANSFER_OUT: [{ value: "TRANSFER", label: "transfer" }],
    DISCARD: [{ value: "NONE", label: "N/A" }],
    RETURN: [{ value: "NONE", label: "N/A" }, { value: "REFUND", label: "return cost" }],
    PRODUCTION_MADE: [{ value: "NONE", label: "N/A" }],
    PRODUCTION_USE: [{ value: "PRODUCE", label: "production" }]
};
export default function StockMovementPanel({ suppliers, stockCount }: StockMovementPanelProps) {
    const [chem, setChem] = useState<null | StockMovementOption<ChemicalRecord>>(null);
    const [loc, setLoc] = useState<null | StockMovementOption<LocationRecord>>(null);
    const [movementType, setMovementType] = useState<null | StockMovementOption<MovementType>>(null);
    const [costType, setCostType] = useState<null | StockMovementOption<CostType>>(costTypeOptions.DISCARD[0]);
    const [moveDate, setMoveDate] = useState<Date | null>(null);
    const [supplier, setSupplier] = useState<null | StockMovementOption<SupplierRecord>>(null);
    const debouncedFetchChemicals = useFuncDebounce<string, StockMovementOption<MinimalChemical>>(fetchPermittedChemicalsOptions, 500);
    const debouncedFetchLocations = useFuncDebounce<string, StockMovementOption<LocationRecord>>(fetchPermittedLocationOptions, 500);
    const router = useRouter();
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
        fetchLocationFilteredChemicalOptions(newLoc).then((ops) => setFilteredChemicalsOptions(ops)); // Otherwise, get all chemicals that match the given location.
    };
    const handleChemChange = (newChem: StockMovementOption<MinimalChemical> | null) => {
        setChem(newChem);
        if (!newChem || !filteredChemicalsOptions?.includes(newChem)) setLoc(null);
        fetchChemicalFilteredLocationOptions(newChem).then(ops =>  setFilteredLocationsOptions(ops));
    };
    const handleMovementTypeChange = (newMovType: StockMovementOption<MovementType> | null) => {
        setMovementType(newMovType);
        if (newMovType?.value) {
            setCostType(costTypeOptions[newMovType.value][0]);
        }
    };
    const submitHandler = async (formEvent: FormEvent<HTMLFormElement>) => {
        const form = formEvent.currentTarget;
        formEvent.preventDefault();
        const formData = new FormData(formEvent.currentTarget);
        if (!movementType || !chem || !loc || !costType) {
            toast.error("Missing types");
            return;
        }
        if (movementType.value === MovementType.RECEIPT && !supplier) {
            toast.error("No supplier specified");
            return;
        }
        const stockMovement : StockMovementCreationSchema = {
            cost: Number(formData.get("cost")),
            quantity: Number(formData.get("quantity")),
            ...(moveDate ? { createdAt: moveDate } : {}),
            movementType: movementType.value,
            supplierId: supplier?.value ?? -1,
            chemicalId: chem.value,
            locationId: loc.value,
            costType: costType.value
        };
        toastifyFetch<ApiResponse<StockMovementNonNested>>(API_ROUTES.STOCK_MOVEMENT, {
            method: "PUT",
            body: JSON.stringify(stockMovement)
        }, {
            loading: "Processing stock movement",
            success: "Stock movement successful",
            error: "Stock movement unsuccessful"
        }, () => {
            reset();
            form.reset();
            router.refresh();
        }, ()=>{});
    };

    return (<div className="card">
        <div className="card-header">Goods issue/receipt</div>
        <div className="card-body">
            <form method="PUT" onSubmit={submitHandler}>
                <div className="d-sm-flex border">
                    <div className="flex-grow-1 p-2">
                        <label htmlFor="chemical">Chemical</label>
                        <AsyncSelect instanceId="mat" id="chemical"
                            isLoading={!filteredChemicalsOptions}
                            defaultOptions={filteredChemicalsOptions ?? []}
                            isClearable
                            value={chem}
                            cacheOptions
                            loadOptions={v => debouncedFetchChemicals(v)}
                            onChange={handleChemChange} />
                    </div>
                    <div className="flex-grow-1 p-2">
                        <label htmlFor="location">Location</label>
                        <AsyncSelect instanceId="loc" id="location"
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
                    <label htmlFor="movement-type">Movement type</label>
                    <Select instanceId="mov" id="movement-type" options={movementTypeOptions} value={movementType} onChange={handleMovementTypeChange} />
                    {movementType && <div>
                        <label htmlFor="cost-type">Cost Type</label>
                        {/* Cost type is limitied by the movement type. ISSUE is only purchase */}
                        <Select instanceId="cost-type" id="cost-type" options={filteredCostTypeOptions} value={costType} onChange={setCostType} />
                        <label htmlFor="cost">Cost</label>
                        <input className="form-control" id="cost" name="cost" type="number" defaultValue={0} required></input>
                    </div>}
                    {movementType?.value === "RECEIPT" && <>
                        <label htmlFor="supplier">Supplier</label>
                        <Select instanceId="sup" id="supplier" options={supplierOptions} value={supplier} onChange={setSupplier} />
                    </>}
                </div>
                <label htmlFor="quantity">Quantity</label>
                <input className="form-control" id="quantity" name="quantity" required type="quantity"></input>
                <label htmlFor="date">Date</label>
                <DatePicker className="w-100" isClearable dateFormat="MMMM d, yyyy h:mm aa" showTimeSelect withPortal showIcon selected={moveDate} onChange={setMoveDate} id="date" />
                <div className="btn-group mt-2">
                    <button className="btn btn-primary" type="submit">Submit</button>
                    <button className="btn btn-secondary" type="reset" onClick={reset}>Reset</button>
                </div>
            </form>
        </div>
    </div>);

}