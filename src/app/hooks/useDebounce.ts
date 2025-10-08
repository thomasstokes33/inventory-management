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