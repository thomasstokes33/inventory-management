import { LocationRecord } from "@/schemas/location";
import { QuantityType } from "@prisma/client";

export function formatLocation(locRecord: LocationRecord) {
    const baseAddress = `${locRecord.address}, ${locRecord.code}`;
    const parts = [baseAddress];
    if (locRecord.bin) parts.push(locRecord.bin);
    if (locRecord.country) parts.push(locRecord.country);
    return parts.join(" — ");
}

export function formatQuantity(quantity: number, quantityType: QuantityType, unit: string | null) {
    let u: string;
    const defaultUnit = "units";
    switch (quantityType) {
        case "MASS":
            u = "g";
            break;
        case "VOLUME":
            u = "ml";
            break;
        case "COUNT":
            u = unit ?? defaultUnit;
            break;
        default:
            u = defaultUnit;
            break;
    }
    return `${quantity} ${u}`;
}