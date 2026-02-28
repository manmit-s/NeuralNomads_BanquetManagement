import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Event } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../lib/utils";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/events");
                setEvents(data.data);
            } catch {
                //
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div>
            <PageHeader title="Events" subtitle="Manage upcoming and past events" />

            {loading ? (
                <LoadingSpinner />
            ) : events.length === 0 ? (
                <EmptyState title="No events yet" description="Events are created from confirmed bookings" />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div key={event.id} className="card cursor-pointer hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <StatusBadge status={event.status} />
                                <span className="text-sm text-gray-500">{formatDate(event.eventDate)}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900">
                                {(event.booking as any)?.lead?.customerName || "Event"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {(event.booking as any)?.hall?.name || "—"} · {event.guestCount} guests
                            </p>
                            <div className="mt-3 flex gap-4 text-xs text-gray-400">
                                <span>{event.menuSelections?.length || 0} menu items</span>
                                <span>{event.checklist?.length || 0} tasks</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
