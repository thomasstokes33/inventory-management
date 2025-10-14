import { useEffect, useRef, useState } from "react";

export default function useDebounce<T>(value: T, timeout: number) {
    const [debouncedVal, setDebouncedVal] = useState<T>(value);
    const timeoutRef = useRef<number>(null);
    useEffect(() => {
        timeoutRef.current = window.setTimeout(() => setDebouncedVal(value), timeout);
        return () => {
            if (!timeoutRef.current) return;
            clearTimeout(timeoutRef.current);
        };
    }, [value, timeout]);

    return debouncedVal;
}  


export function useFuncDebounce<I, R >(func: (...args: I[]) => Promise<R[]>, delay: number) {
    const timeout = useRef<number>(null);
    return (...args: I[]) => new Promise<R[]>((resolve) => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = window.setTimeout(async () => {
            const res = await func(...args);
            console.log(res);
            resolve(res);
        }, delay);
    });
}