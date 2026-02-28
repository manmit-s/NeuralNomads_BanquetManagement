import { useEffect, useState } from "react";
import api from "../../lib/api";
import { formatCurrency } from "../../lib/utils";
import type { DashboardSummary, PipelineItem } from "../../types";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, CalendarDays, UtensilsCrossed, IndianRupee, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [summaryRes, pipelineRes] = await Promise.all([
                    api.get("/reports/dashboard"),
                    api.get("/leads/pipeline"),
                ]);
                setSummary(summaryRes.data.data);
                setPipeline(pipelineRes.data.data);
            } catch {
                // handled by interceptor
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Overview of your banquet business" />

            {/* Stat cards */}
            {summary && (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard title="Leads This Month" value={summary.totalLeadsThisMonth} icon={<Users size={20} />} />
                    <StatCard title="Active Bookings" value={summary.activeBookings} icon={<CalendarDays size={20} />} />
                    <StatCard title="Upcoming Events" value={summary.upcomingEvents} icon={<UtensilsCrossed size={20} />} />
                    <StatCard title="Monthly Revenue" value={formatCurrency(summary.monthlyRevenue)} icon={<IndianRupee size={20} />} />
                    <StatCard title="Outstanding" value={formatCurrency(summary.totalOutstanding)} icon={<AlertTriangle size={20} />} />
                </div>
            )}

            {/* Pipeline */}
            <div className="card">
                <h3 className="mb-4 text-lg font-semibold">Lead Pipeline</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {pipeline.map((item) => (
                        <div key={item.status} className="rounded-lg border border-gray-200 p-3 text-center">
                            <p className="text-2xl font-bold text-primary-600">{item.count}</p>
                            <p className="mt-1 text-xs text-gray-500">{item.status.replace(/_/g, " ")}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
