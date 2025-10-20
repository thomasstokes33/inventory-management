import { NextResponse } from "next/server";
import StatusCode from "status-code-enum";
const API_PREFIX = "/api";
export const API_ROUTES = {
    STOCKS: API_PREFIX + "/stocks",
    CHEMICALS: API_PREFIX + "/chemicals",
    STOCK_MOVEMENT: API_PREFIX + "/stock-movement"
};


export type ApiResponse<T> =  { error: string } | { data: T } | { errors: string[] };
export function generateResponse<T>(body: ApiResponse<T>, status: StatusCode) : NextResponse<ApiResponse<T>>{
    return NextResponse.json(body, { status: status });
}

export function validId(rawId: unknown)  : boolean {
        // Handle zero length string, otherwise the chem ID becomes zero.
    if (rawId === "") return false;
    // Check ID is a number (but rely on try catch for ID validity.)
    const chemId = Number(rawId);
    if (isNaN(chemId)) return false;
    return true;
}