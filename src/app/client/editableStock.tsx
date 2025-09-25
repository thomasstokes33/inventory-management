"use client";

import { ChemicalRow } from "@/schemas/chemical";
import { useState } from "react";

type editableStockProps = {
    chemical: ChemicalRow
}

export default function EditableStock({ chemical }: editableStockProps) {
    const [stock, setStock] = useState<number>(chemical.stockQuantity);
    const [editing, setEditing] = useState<boolean>(false);
    let displayVal: string;
    switch (chemical.quantityType) {
        case "COUNT":
            displayVal = `${chemical.unit ?? ""}`;
            break;
        case "MASS":
            displayVal = "g";
            break;
        case "VOLUME":
            displayVal = "ml";
            break;
        default:
            displayVal = "";
            break;
    }
    const save = async (val: string) => {
        console.log(val);
        if (val !== "" && Number.isFinite(Number(val)) && Number(val) >= 0) {
            const number = Number(val);
            setStock(number);
            await fetch(`/api/chemicals/${chemical.id}`, {
                method: "PUT",
                body: JSON.stringify({ stockQuantity: number }),
                headers: { "Content-Type": "application/json" }
            });
        } 
        setEditing(false);
    };

    return (editing ?
        (<div className="input-group">
            <input id="stock-update-inline" className="form-control" type="number" defaultValue={stock} onBlur={(event) => save(event.target.value)}
                onKeyDown={(event) => { if (event.key == "Enter") save(event.currentTarget.value); }} autoFocus />
            <div className="input-group-append">
                <span className="input-group-text">{displayVal}</span>
            </div>
        </div>)
        : (<span onClick={() => setEditing(true)}>{`${stock} ${displayVal}`}</span>)
    );
}