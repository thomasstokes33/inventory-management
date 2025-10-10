import { LocationRecord } from "@/schemas/location";

export default function formatLocation(locRecord : LocationRecord) {
    const baseAddress = `${locRecord.address}, ${locRecord.code}`;
    const parts = [baseAddress];
    if (locRecord.bin) parts.push(locRecord.bin);
    if (locRecord.country) parts.push(locRecord.country);
    return parts.join(" — ");
}