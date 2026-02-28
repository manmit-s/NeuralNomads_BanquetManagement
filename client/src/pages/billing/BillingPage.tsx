import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Invoice } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, formatCurrency } from "../../lib/utils";

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/billing/invoices");
                setInvoices(data.data);
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
            <PageHeader title="Billing" subtitle="Invoices and payment tracking" />

            {loading ? (
                <LoadingSpinner />
            ) : invoices.length === 0 ? (
                <EmptyState title="No invoices yet" description="Invoices are generated from bookings" />
            ) : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="table-header">Invoice #</th>
                                <th className="table-header">Customer</th>
                                <th className="table-header">Total</th>
                                <th className="table-header">Paid</th>
                                <th className="table-header">Due Date</th>
                                <th className="table-header">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="table-cell font-mono text-sm font-medium">{inv.invoiceNumber}</td>
                                    <td className="table-cell">{(inv.booking as any)?.lead?.customerName || "—"}</td>
                                    <td className="table-cell">{formatCurrency(inv.totalAmount)}</td>
                                    <td className="table-cell text-green-600">{formatCurrency(inv.paidAmount)}</td>
                                    <td className="table-cell">{formatDate(inv.dueDate)}</td>
                                    <td className="table-cell"><StatusBadge status={inv.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
