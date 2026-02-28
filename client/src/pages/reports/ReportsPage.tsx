import { useState } from "react";
import {
    BarChart3,
    TrendingUp,
    IndianRupee,
    Users,
    CalendarDays,
    Download,
} from "lucide-react";
import {
    LineChart,
    Line,
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
    AreaChart,
    Area,
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { cn, formatCurrency } from "@/lib/utils";
import {
    DEMO_REVENUE_DATA,
    DEMO_EVENT_TYPE_DATA,
    DEMO_BRANCH_CHART_DATA,
    DEMO_OCCUPANCY_DATA,
} from "@/data/demo";

// Chart palette — dark gold theme
const GOLD = "#D4AF37";

// Use centralized demo data
const revenueData = DEMO_REVENUE_DATA;
const eventTypeData = DEMO_EVENT_TYPE_DATA;
const branchData = DEMO_BRANCH_CHART_DATA;
const occupancyData = DEMO_OCCUPANCY_DATA;

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
    const [period, setPeriod] = useState<"month" | "quarter" | "year">("year");

    const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const totalBookings = revenueData.reduce((s, d) => s + d.bookings, 0);
    const avgOccupancy = Math.round(
        occupancyData.reduce((s, d) => s + d.rate, 0) / occupancyData.length
    );

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
                <KPISummary icon={IndianRupee} label="Total Revenue" value={formatCurrency(totalRevenue)} />
                <KPISummary icon={CalendarDays} label="Total Bookings" value={totalBookings.toString()} />
                <KPISummary icon={TrendingUp} label="Avg Occupancy" value={`${avgOccupancy}%`} />
                <KPISummary icon={Users} label="Conversion Rate" value="68%" />
            </div>

            {/* Revenue Trend */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-2">
                    <GlassCard>
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-white mb-6">Revenue Trend</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={GOLD} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222228" />
                                    <XAxis dataKey="month" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={GOLD}
                                        strokeWidth={2}
                                        fill="url(#goldGrad)"
                                        name="Revenue"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Event Type Distribution */}
                <GlassCard>
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-6">Event Types</h3>
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
                    </div>
                </GlassCard>
            </div>

            {/* Branch Performance + Occupancy */}
            <div className="grid grid-cols-2 gap-6">
                {/* Branch Comparison */}
                <GlassCard>
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-6">Branch Performance</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={branchData} layout="vertical" barSize={18}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222228" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                                <YAxis type="category" dataKey="branch" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="Revenue" fill={GOLD} radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Occupancy Trend */}
                <GlassCard>
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-6">Occupancy Rate</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={occupancyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222228" />
                                <XAxis dataKey="month" tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#71717A", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke={GOLD}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: GOLD, stroke: "#0B0B0F", strokeWidth: 2 }}
                                    name="Occupancy"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>
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
