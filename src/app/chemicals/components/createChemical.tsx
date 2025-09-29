"use client";

import { MaterialType, QuantityType, Status } from "@prisma/client";
import { Router } from "next/router";
import { FormEvent, useState } from "react";
import z, { set } from "zod";




export default function CreateChemical() {
    const [message, setMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean| null>(null);
    async function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(null);
        setSuccess(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        console.log(e.currentTarget.quantityType.value);
        const res = await fetch("/api/chemicals", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(true);
            setMessage("Successfully added chemical");
            form.reset();
        } else {
            console.log(data);
            setSuccess(false);
            setMessage("Could not create chemical");
        }
    }
    return (
        <div className="card">
            <div className="card-header">
                Add new Chemical
            </div>
            <div className="card-body">
                <form method="post" onSubmit={handleCreateSubmit}>
                    <label>Name</label>
                    <input name="name" type="text" className="form-control" required />
                    <label>Status</label>
                    <select name="status" className="form-select">
                        {Object.values(Status).map((value) => (
                            <option key={value} value={value}>{value.toLowerCase()}</option>
                        ))}
                    </select>
                    <label>Material</label>
                    <select name="materialType" className="form-select">
                        {Object.values(MaterialType).map((value) => (
                            <option key={value} value={value}>{value.toLowerCase()}</option>
                        ))}
                    </select>
                    <label>Quantity Type</label>
                    <select name="quantityType" className="form-select" >
                        {Object.values(QuantityType).map((value) => (
                            <option key={value} value={value}>{value.toLowerCase()}</option>
                        ))}
                    </select>
                    <div>
                        <label>Count unit (only used if Quantity type is &quot;count&quot;)</label>
                        <input name="unit" type="number" className="form-control" required={false} />
                    </div>
                    <div className="mt-2">
                        <button type="submit" className="btn btn-primary me-2">Add Chemical</button>
                        <button type="reset" className="btn btn-secondary">Reset</button>
                    </div>
                    {message !== null && <div className={`alert alert-${success ? "success":"danger"}`}>{message}</div>}
                </form>
            </div>
        </div>
    );
}