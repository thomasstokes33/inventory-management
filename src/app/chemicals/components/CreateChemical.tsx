"use client";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import { HazardClass, MaterialType, QuantityType, Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_ROUTES } from "@/lib/apiRoutes";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
type CreateChemicalProps = { hazardClasses: HazardClass[] }
export default function CreateChemical({ hazardClasses }: CreateChemicalProps) {
    const router = useRouter();
    const [message, setMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean| null>(null);
    const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setSuccess(null);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const res = await fetch(API_ROUTES.CHEMICALS, {
            method: "PUT",
            body: formData
        });
        await res.json();
        if (res.ok) {
            setSuccess(true);
            setMessage("Successfully added chemical");
            form.reset();
            router.refresh(); // reloads components without reloading page.
        } else {
            setSuccess(false);
            setMessage("Could not create chemical");
        }
    };
    const tooltip = (
        <Tooltip id="tooltip">
            (only used if Quantity type is &quot;count&quot;)
        </Tooltip>
    );
    return (
        <div className="card">
            <div className="card-header">
                Add new chemical
            </div>
            <div className="card-body">
                <form method="PUT" onSubmit={handleCreateSubmit}>
                    <label htmlFor="create-name">Name</label>
                    <input id="create-name" name="name" type="text" className="form-control" required />
                    <label htmlFor="create-status">Status</label>
                    <select id="create-status" name="status" className="form-select">
                        {Object.values(Status).map((value) => (
                            <option key={value} value={value}>{value.toLowerCase()}</option>
                        ))}
                    </select>
                    <label htmlFor="create-hazard-class">Hazard classes</label>
                    <select id="create-hazard-class"  name="hazardClass" className="form-select" multiple> 
                        {hazardClasses.map((hazardClass, key) => (<option key={key} value={hazardClass.id}>{hazardClass.classification}</option>))}
                    </select>
                    <label htmlFor="create-material-type">Material</label>
                    <select id="create-material-type" name="materialType" className="form-select">
                        {Object.values(MaterialType).map((value) => (
                            <option key={value} value={value}>{value.toLowerCase()}</option>
                        ))}
                    </select>
                    <label htmlFor="create-quantity-type">Quantity type</label>
                    <select id="create-quantity-type" name="quantityType" className="form-select" >
                        {Object.values(QuantityType).map((value) => (
                            <option key={value} value={value}>{value.toLowerCase()}</option>
                        ))}
                    </select>
                    <div>
                        <label htmlFor="create-count">Count unit (add plural form in brackets)</label>
                        <div>
                            <OverlayTrigger placement="right" overlay={tooltip}>
                                <i className="bi bi-info-square"></i>
                            </OverlayTrigger>
                        </div>
                        <input id="create-count" name="unit" type="string" className="form-control" required={false} />
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