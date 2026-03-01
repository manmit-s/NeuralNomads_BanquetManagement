import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import type { BookingResource } from "@/types";

interface UseBookingResourcesReturn {
    resources: BookingResource[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    fetch: (force?: boolean) => Promise<void>;
    save: (updates: { resourceId: string; manualQty: number }[]) => Promise<void>;
    recalculate: () => Promise<void>;
}

export function useBookingResources(bookingId: string | null): UseBookingResourcesReturn {
    const [resources, setResources] = useState<BookingResource[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResources = useCallback(
        async (force = false) => {
            if (!bookingId) return;
            setLoading(true);
            setError(null);
            try {
                const url = force
                    ? `/bookings/${bookingId}/resources?force=true`
                    : `/bookings/${bookingId}/resources`;
                const res = await api.get(url);
                setResources(res.data.data ?? []);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to load resources");
            } finally {
                setLoading(false);
            }
        },
        [bookingId]
    );

    const save = useCallback(
        async (updates: { resourceId: string; manualQty: number }[]) => {
            if (!bookingId) return;
            setSaving(true);
            setError(null);
            try {
                const res = await api.put(`/bookings/${bookingId}/resources`, { resources: updates });
                setResources(res.data.data ?? []);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to save resources");
            } finally {
                setSaving(false);
            }
        },
        [bookingId]
    );

    const recalculate = useCallback(async () => {
        await fetchResources(true);
    }, [fetchResources]);

    useEffect(() => {
        if (bookingId) {
            fetchResources();
        } else {
            setResources([]);
            setError(null);
        }
    }, [bookingId, fetchResources]);

    return { resources, loading, saving, error, fetch: fetchResources, save, recalculate };
}
