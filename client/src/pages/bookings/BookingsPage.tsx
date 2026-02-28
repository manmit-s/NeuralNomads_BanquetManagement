import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Booking } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, formatCurrency } from "../../lib/utils";
import { Plus } from "lucide-react";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/bookings", { params: { limit: 50 } });
                setBookings(data.data);
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
            <PageHeader
                title="Bookings"
                subtitle="Manage hall reservations"
                action={<button className="btn-primary flex items-center gap-2"><Plus size={18} /> New Booking</button>}
            />

            {loading ? (
                <LoadingSpinner />
            ) : bookings.length === 0 ? (
                <EmptyState title="No bookings yet" description="Bookings are created from confirmed leads" />
            ) : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="table-header">Booking #</th>
                                <th className="table-header">Customer</th>
                                <th className="table-header">Hall</th>
                                <th className="table-header">Date</th>
                                <th className="table-header">Guests</th>
                                <th className="table-header">Total</th>
                                <th className="table-header">Balance</th>
                                <th className="table-header">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="table-cell font-mono text-sm font-medium">{b.bookingNumber}</td>
                                    <td className="table-cell">{b.lead?.customerName || "—"}</td>
                                    <td className="table-cell">{b.hall?.name || "—"}</td>
                                    <td className="table-cell">{formatDate(b.startDate)}</td>
                                    <td className="table-cell">{b.guestCount}</td>
                                    <td className="table-cell">{formatCurrency(b.totalAmount)}</td>
                                    <td className="table-cell font-medium text-red-600">{formatCurrency(b.balanceAmount)}</td>
                                    <td className="table-cell"><StatusBadge status={b.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
