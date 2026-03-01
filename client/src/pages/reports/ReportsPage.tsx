import { useState, useEffect, useMemo } from "react";
import {
    BarChart3,
    TrendingUp,
    IndianRupee,
    Users,
    CalendarDays,
    Download,
    Loader2,
} from "lucide-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { cn, formatCurrency } from "@/lib/utils";
import { useBranchStore } from "@/stores/branchStore";
import api from "@/lib/api";

// Chart palette — dark gold theme
const GOLD = "#D4AF37";
const PIE_COLORS = ["#D4AF37", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#10B981"];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-card">
            <p className="text-xs font-medium text-white mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-xs text-muted">
                    {p.name}: <span className="text-white font-medium">
                        {typeof p.value === "number" && p.value > 1000
                            ? formatCurrency(p.value)
                            : p.value}
                    </span>
                </p>
            ))}
        </div>
    );
};

export default function ReportsPage() {
    const { selectedBranchId } = useBranchStore();
    const [period, setPeriod] = useState<"month" | "quarter" | "year">("year");
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<any>(null);
    const [branchPerf, setBranchPerf] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                if (selectedBranchId) params.branchId = selectedBranchId;

                const [dashRes, branchRes, bookingsRes] = await Promise.allSettled([
                    api.get("/reports/dashboard", { params, timeout: 5000 }),
                    api.get("/reports/branch-performance", { params, timeout: 5000 }),
                    api.get("/bookings", { params: { ...params, limit: "200" }, timeout: 5000 }),
                ]);

                if (!cancelled) {
                    if (dashRes.status === "fulfilled") setDashboard(dashRes.value.data?.data || null);
                    if (branchRes.status === "fulfilled") setBranchPerf(branchRes.value.data?.data || []);
                    if (bookingsRes.status === "fulfilled") {
                        const bd = bookingsRes.value.data?.data?.data || bookingsRes.value.data?.data || [];
                        setBookings(Array.isArray(bd) ? bd : []);
                    }
                }
            } catch { /* leave empty */ }
            finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [selectedBranchId]);

    // Derive event type distribution from bookings
    const eventTypeData = useMemo(() => {
        if (bookings.length === 0) return [];
        const counts: Record<string, number> = {};
        bookings.forEach((b: any) => {
            const type = b.eventType || b.lead?.eventType || "Other";
            counts[type] = (counts[type] || 0) + 1;
        });
        const total = bookings.length;
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count], i) => ({
                name,
                value: Math.round((count / total) * 100),
                color: PIE_COLORS[i % PIE_COLORS.length],
            }));
    }, [bookings]);

    // Branch chart data
    const branchChartData = useMemo(() => {
        return branchPerf.map((b: any) => ({
            branch: b.branchName || "Unknown",
            revenue: b.totalRevenue || 0,
        }));
    }, [branchPerf]);

    const totalRevenue = dashboard?.monthlyRevenue || 0;
    const totalBookings = dashboard?.activeBookings || 0;
    const totalLeads = dashboard?.totalLeadsThisMonth || 0;
    const upcomingEvents = dashboard?.upcomingEvents || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-amber-400" size={32} />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Reports"
                subtitle="Analytics and performance insights"
                icon={BarChart3}
                action={
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1 bg-surface/50 p-1 rounded-xl">
                            {(["month", "quarter", "year"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize",
                                        period === p
                                            ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                            : "text-muted hover:text-white"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button className="btn-outline text-xs">
                            <Download className="h-3.5 w-3.5" />
                            Export
                        </button>
                    </div>
                }
            />

            {/* Summary KPIs */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <KPISummary icon={IndianRupee} label="Monthly Revenue" value={formatCurrency(totalRevenue)} />
                <KPISummary icon={CalendarDays} label="Active Bookings" value={totalBookings.toString()} />
                <KPISummary icon={TrendingUp} label="Upcoming Events" value={upcomingEvents.toString()} />
                <KPISummary icon={Users} label="Leads This Month" value={totalLeads.toString()} />
            </div>

            {/* Branch Performance + Event Types */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Branch Comparison */}
                <div className="col-span-2">
                    <GlassCard>
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-white mb-6">Branch Performance</h3>
                            {branchChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={branchChartData} layout="vertical" barSize={18}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222228" horizontal={false} />
                                        <XAxis type="number" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                                        <YAxis type="category" dataKey="branch" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="revenue" name="Revenue" fill={GOLD} radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-sm text-muted py-12 text-center">No branch data yet. Create bookings to see performance.</p>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Event Type Distribution */}
                <GlassCard>
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-6">Event Types</h3>
                        {eventTypeData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={eventTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {eventTypeData.map((entry, idx) => (
                                                <Cell key={idx} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2 mt-4">
                                    {eventTypeData.map((e) => (
                                        <div key={e.name} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                                                <span className="text-muted">{e.name}</span>
                                            </div>
                                            <span className="text-white font-medium">{e.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted py-12 text-center">No bookings yet</p>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Outstanding Summary */}
            <GlassCard>
                <div className="p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Outstanding Summary</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-muted mb-1">Total Outstanding</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(dashboard?.totalOutstanding || 0)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted mb-1">Active Bookings</p>
                            <p className="text-lg font-bold text-white">{dashboard?.activeBookings || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted mb-1">Upcoming Events</p>
                            <p className="text-lg font-bold text-white">{dashboard?.upcomingEvents || 0}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

function KPISummary({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <GlassCard>
            <div className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-lg font-bold text-white">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
}
