import { useState, useEffect, useCallback, useRef } from "react";
import api from "./api";

/**
 * Hook that tries to fetch data from the real API first.
 * If the API call fails (server down, DB error, etc.), it falls back to demo data.
 *
 * @param endpoint  API endpoint, e.g. "/branches"
 * @param demoData  Fallback demo data array/object
 * @param options   Optional: extract key from API response, auto-fetch toggle
 */
export function useApiWithFallback<T>(
    endpoint: string,
    demoData: T,
    options?: {
        /** key to extract from API response (default: "data") */
        dataKey?: string;
        /** disable auto-fetch on mount */
        manual?: boolean;
        /** query params */
        params?: Record<string, string | number | undefined>;
        /** optional transform applied to API data before storing */
        transform?: (raw: any) => T;
    }
) {
    const dataKey = options?.dataKey ?? "data";
    const manual = options?.manual ?? false;
    const params = options?.params;
    const transform = options?.transform;

    const [data, setData] = useState<T>(demoData);
    const [loading, setLoading] = useState(!manual);
    const [isDemo, setIsDemo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(endpoint, { params, timeout: 5000 });
            if (!mountedRef.current) return;
            const apiData = dataKey ? res.data?.[dataKey] : res.data;
            if (apiData !== undefined && apiData !== null) {
                setData(transform ? transform(apiData) : apiData);
                setIsDemo(false);
            } else {
                // API returned empty/null — use demo
                setData(demoData);
                setIsDemo(true);
            }
        } catch (err: any) {
            if (!mountedRef.current) return;
            console.warn(`[API fallback] ${endpoint} failed, using demo data:`, err.message);
            setData(demoData);
            setIsDemo(true);
            setError(err.message);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [endpoint, JSON.stringify(params)]);

    useEffect(() => {
        mountedRef.current = true;
        if (!manual) fetchData();
        return () => { mountedRef.current = false; };
    }, [fetchData, manual]);

    return { data, loading, isDemo, error, refetch: fetchData, setData };
}
