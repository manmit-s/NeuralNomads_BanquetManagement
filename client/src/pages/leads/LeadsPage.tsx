import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Lead } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, LEAD_STATUS_LABELS } from "../../lib/utils";
import { Plus } from "lucide-react";

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        loadLeads();
    }, [statusFilter]);

    async function loadLeads() {
        setLoading(true);
        try {
            const params: any = { limit: 50 };
            if (statusFilter) params.status = statusFilter;
            const { data } = await api.get("/leads", { params });
            setLeads(data.data);
        } catch {
            // handled by interceptor
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <PageHeader
                title="Leads"
                subtitle="Manage your sales pipeline"
                action={<button className="btn-primary flex items-center gap-2"><Plus size={18} /> New Lead</button>}
            />

            {/* Filters */}
            <div className="mb-4 flex gap-3">
                <select
                    className="input w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : leads.length === 0 ? (
                <EmptyState title="No leads found" description="Start by adding your first lead" />
            ) : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="table-header">Customer</th>
                                <th className="table-header">Phone</th>
                                <th className="table-header">Event Type</th>
                                <th className="table-header">Date</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Assigned To</th>
                                <th className="table-header">Branch</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="table-cell font-medium">{lead.customerName}</td>
                                    <td className="table-cell">{lead.customerPhone}</td>
                                    <td className="table-cell">{lead.eventType}</td>
                                    <td className="table-cell">{lead.eventDate ? formatDate(lead.eventDate) : "—"}</td>
                                    <td className="table-cell"><StatusBadge status={lead.status} /></td>
                                    <td className="table-cell">{lead.assignedTo?.name || "—"}</td>
                                    <td className="table-cell text-gray-500">{lead.branch?.name || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
