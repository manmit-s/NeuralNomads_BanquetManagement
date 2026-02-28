import { useEffect, useState } from "react";
import api from "../../lib/api";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatCurrency } from "../../lib/utils";

interface RevenueData {
    branchId: string;
    branchName: string;
    totalRevenue: number;
    invoiceCount: number;
}

interface ConversionData {
    total: number;
    converted: number;
    conversionRate: number;
}

interface OutstandingData {
    totalOutstanding: number;
    invoiceCount: number;
    overdueCount: number;
}

export default function ReportsPage() {
    const [revenue, setRevenue] = useState<RevenueData[]>([]);
    const [conversion, setConversion] = useState<ConversionData | null>(null);
    const [outstanding, setOutstanding] = useState<OutstandingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const to = now.toISOString();

            try {
                const [revRes, convRes, outRes] = await Promise.all([
                    api.get("/reports/revenue", { params: { from, to } }),
                    api.get("/reports/conversion", { params: { from, to } }),
                    api.get("/reports/outstanding"),
                ]);
                setRevenue(revRes.data.data);
                setConversion(convRes.data.data);
                setOutstanding(outRes.data.data);
            } catch {
                //
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader title="Reports" subtitle="Analytics and business insights" />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue */}
                <div className="card">
                    <h3 className="mb-4 text-lg font-semibold">Branch Revenue (This Month)</h3>
                    {revenue.length === 0 ? (
                        <p className="text-sm text-gray-500">No data available</p>
                    ) : (
                        <div className="space-y-3">
                            {revenue.map((r) => (
                                <div key={r.branchId} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                                    <div>
                                        <p className="font-medium text-gray-900">{r.branchName}</p>
                                        <p className="text-xs text-gray-500">{r.invoiceCount} invoices</p>
                                    </div>
                                    <p className="text-lg font-bold text-primary-600">{formatCurrency(r.totalRevenue)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conversion & Outstanding */}
                <div className="space-y-6">
                    {conversion && (
                        <div className="card">
                            <h3 className="mb-4 text-lg font-semibold">Lead Conversion</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{conversion.total}</p>
                                    <p className="text-xs text-gray-500">Total Leads</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{conversion.converted}</p>
                                    <p className="text-xs text-gray-500">Converted</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-primary-600">{conversion.conversionRate}%</p>
                                    <p className="text-xs text-gray-500">Rate</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {outstanding && (
                        <div className="card">
                            <h3 className="mb-4 text-lg font-semibold">Outstanding Summary</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(outstanding.totalOutstanding)}</p>
                                    <p className="text-xs text-gray-500">Total Outstanding</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{outstanding.invoiceCount}</p>
                                    <p className="text-xs text-gray-500">Pending Invoices</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">{outstanding.overdueCount}</p>
                                    <p className="text-xs text-gray-500">Overdue</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
