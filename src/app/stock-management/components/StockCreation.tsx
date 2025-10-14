"use client";

import { MinimalChemical } from "@/app/api/chemicals/route";
import { useFuncDebounce } from "@/app/hooks/useDebounce";
import { API_ROUTES } from "@/lib/apiRoutes";
import { formatLocation } from "@/lib/formatter";
import { toastifyFetch } from "@/lib/toastHelper";
import { LocationRecord } from "@/schemas/location";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Options } from "react-select";
import Select from "react-select";
import AsyncSelect from "react-select/async";
type StockCreationDeletionProps = { locations: LocationRecord[] }

type SelectOption = {
    value: number
    label: string
}
async function fetchChemicalOptions(inputChemical: string): Promise<SelectOption[]> {  // Moved outside as no state is used.
    const res = await fetch(`${API_ROUTES.CHEMICALS}?query=${encodeURIComponent(inputChemical)}`);
    if (!res.ok) return [];
    else {
        const data = await res.json();
        const chemicals: MinimalChemical[] = data.chemicals;
        return chemicals.map(item => ({ value: item.id, label: item.name }));
    }
};

export default function StockCreation({ locations }: StockCreationDeletionProps) {
    const locationOptions: Options<SelectOption> = locations.map((loc) => ({
        value: loc.id, label: formatLocation(loc)
    }));
    const [selectedLocation, setSelectedLocation] = useState<SelectOption | null>(null);
    const [selectedChemical, setSelectedChemical] = useState<SelectOption | null>(null);
    const debouncedFetchChemOptions = useFuncDebounce<string, SelectOption>(fetchChemicalOptions, 500);
    const resetForm = () => {
        setSelectedLocation(null);
        setSelectedChemical(null);
    };
    const router = useRouter();
    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        toastifyFetch(API_ROUTES.STOCKS, {
            method: "PUT",
            body: JSON.stringify({ locationId: selectedLocation?.value, chemicalId: selectedChemical?.value })
        }, {
            loading: "Defining new stock",
            success: "Stock combination created",
            error: "Combination not created" // non unique or non existent.
        }, () => {
            router.refresh();
            resetForm();
        }, () => { });
    };
    return (<div className="card">
        <div className="card-header">Setup location</div>
        <div className="card-body">
            <form method="PUT" onSubmit={submitForm}>
                <label className="form-label" htmlFor="stock-creation-chemical">Chemical</label>
                <AsyncSelect defaultOptions id="stock-creation-chemical" instanceId="chem" required onChange={setSelectedChemical} loadOptions={(input) => debouncedFetchChemOptions(input)} cacheOptions value={selectedChemical} isClearable />
                <div className="mb-2">
                    <label htmlFor="stock-creation-location" className="form-label">Location</label>
                    <Select instanceId="loc" required id="stock-creation-location" options={locationOptions} isClearable onChange={setSelectedLocation} value={selectedLocation} />
                </div>
                <div className="btn-group">
                    <button className="btn btn-primary" type="submit" >Submit</button>
                    <button className="btn btn-secondary" type="reset" onClick={resetForm}>Reset</button>
                </div>
            </form>
        </div>
    </div>);
}