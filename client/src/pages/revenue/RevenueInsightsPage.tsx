import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    AlertTriangle,
    Lightbulb,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    SlidersHorizontal,
    Building2,
    Loader2,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { cn, formatCurrency } from "@/lib/utils";
import { useBranchStore } from "@/stores/branchStore";
import api from "@/lib/api";

/* ── Types (mirror backend response shapes) ── */

interface RevenueInsight {
    id: string;
    type: "OPPORTUNITY" | "RISK" | "INFO";
    severity: "LOW" | "MEDIUM" | "HIGH";
    title: string;
    description: string;
    recommendation: string;
    projectedImpact: string;
    hallName?: string;
}

interface HallPerformance {
    hallId: string;
    hallName: string;
    branchName: string;
    capacity: number;
    pricePerEvent: number;
    confirmedNext30: number;
    maxSlots: number;
    occupancyPct: number;
    revenueThisMonth: number;
    revenuePrevMonth: number;
    revenueTrend: "UP" | "DOWN" | "FLAT";
    status: "High Demand" | "Stable" | "Low Demand";
}

interface SimulationResult {
    currentMonthlyRevenue: number;
    projectedRevenue: number;
    revenueDifference: number;
    estimatedBookingChange: number;
    explanation: string;
}

/* ── Severity / Type styling helpers ── */

const severityStyles: Record<string, { bg: string; text: string; border: string }> = {
    HIGH: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
    MEDIUM: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    LOW: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
};

const typeIcon: Record<string, typeof TrendingUp> = {
    OPPORTUNITY: Lightbulb,
    RISK: AlertTriangle,
    INFO: Info,
};

const statusStyle: Record<string, string> = {
    "High Demand": "bg-green-500/20 text-green-400 border-green-500/30",
    Stable: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Low Demand": "bg-red-500/20 text-red-400 border-red-500/30",
};

/* ── Page Component ── */

export default function RevenueInsightsPage() {
    const { selectedBranchId } = useBranchStore();

    const [insights, setInsights] = useState<RevenueInsight[]>([]);
    const [halls, setHalls] = useState<HallPerformance[]>([]);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [sliderValue, setSliderValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [simLoading, setSimLoading] = useState(false);

    /* ── Fetch insights + hall performance ── */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const params: Record<string, string> = {};
                if (selectedBranchId) params.branchId = selectedBranchId;

                const [insightsRes, perfRes] = await Promise.allSettled([
                    api.get("/revenue/insights", { params }),
                    api.get("/revenue/performance", { params }),
                ]);

                if (!cancelled) {
                    if (insightsRes.status === "fulfilled")
                        setInsights(insightsRes.value.data?.data || []);
                    if (perfRes.status === "fulfilled")
                        setHalls(perfRes.value.data?.data || []);
                }
            } catch {
                /* silent */
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedBranchId]);

    /* ── Simulation handler ── */
    const handleSimulate = async (val: number) => {
        setSliderValue(val);
        if (val === 0) {
            setSimulation(null);
            return;
        }
        setSimLoading(true);
        try {
            const params: Record<string, string> = { change: String(val) };
            if (selectedBranchId) params.branchId = selectedBranchId;
            const res = await api.get("/revenue/simulate", { params });
            setSimulation(res.data?.data || null);
        } catch {
            /* silent */
        } finally {
            setSimLoading(false);
        }
    };

    /* ── Aggregate KPIs ── */
    const totalRevenueThisMonth = useMemo(
        () => halls.reduce((s, h) => s + h.revenueThisMonth, 0),
        [halls],
    );
    const avgOccupancy = useMemo(
        () => (halls.length ? Math.round(halls.reduce((s, h) => s + h.occupancyPct, 0) / halls.length) : 0),
        [halls],
    );
    const highSeverityCount = useMemo(
        () => insights.filter((i) => i.severity === "HIGH").length,
        [insights],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-amber-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Revenue Insights"
                subtitle="Analyse performance, detect opportunities, and simulate changes"
                icon={TrendingUp}
            />

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPIBox
                    label="This Month Revenue"
                    value={formatCurrency(totalRevenueThisMonth)}
                    color="text-green-400"
                />
                <KPIBox
                    label="Avg Occupancy (30d)"
                    value={`${avgOccupancy}%`}
                    color={avgOccupancy >= 60 ? "text-green-400" : avgOccupancy >= 40 ? "text-amber-400" : "text-red-400"}
                />
                <KPIBox
                    label="Active Alerts"
                    value={String(highSeverityCount)}
                    color={highSeverityCount > 0 ? "text-red-400" : "text-green-400"}
                />
            </div>

            {/* ── SECTION 1 — Revenue Alerts ── */}
            <div>
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gold-400" />
                    Revenue Alerts &amp; Recommendations
                </h2>
                {insights.length === 0 ? (
                    <GlassCard>
                        <p className="text-sm text-muted text-center py-6">
                            No insights available yet. Add more bookings to see recommendations.
                        </p>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {insights.map((insight, i) => (
                            <InsightCard key={insight.id} insight={insight} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── SECTION 2 — Hall Performance ── */}
            <div>
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gold-400" />
                    Hall Performance Summary
                </h2>
                <GlassCard padding={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50">
                                    {["Hall", "Occupancy %", "Revenue Trend", "Status"].map(
                                        (col) => (
                                            <th
                                                key={col}
                                                className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                                            >
                                                {col}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {halls.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted">
                                            No hall data available
                                        </td>
                                    </tr>
                                ) : (
                                    halls.map((h, i) => (
                                        <motion.tr
                                            key={h.hallId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{h.hallName}</p>
                                                    <p className="text-xs text-muted">{h.branchName}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 max-w-[120px] h-2 rounded-full bg-white/5 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all",
                                                                h.occupancyPct > 75
                                                                    ? "bg-green-500"
                                                                    : h.occupancyPct >= 40
                                                                        ? "bg-amber-500"
                                                                        : "bg-red-500",
                                                            )}
                                                            style={{ width: `${Math.min(h.occupancyPct, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-white tabular-nums">
                                                        {h.occupancyPct}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1 text-xs font-medium",
                                                        h.revenueTrend === "UP"
                                                            ? "text-green-400"
                                                            : h.revenueTrend === "DOWN"
                                                                ? "text-red-400"
                                                                : "text-muted",
                                                    )}
                                                >
                                                    {h.revenueTrend === "UP" && <ArrowUpRight className="h-3 w-3" />}
                                                    {h.revenueTrend === "DOWN" && <ArrowDownRight className="h-3 w-3" />}
                                                    {h.revenueTrend === "FLAT" && <Minus className="h-3 w-3" />}
                                                    {h.revenueTrend}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border",
                                                        statusStyle[h.status] || "bg-gray-500/20 text-gray-400 border-gray-500/30",
                                                    )}
                                                >
                                                    {h.status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* ── SECTION 3 — Revenue Simulator ── */}
            <div>
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-gold-400" />
                    Revenue Simulator
                </h2>
                <GlassCard>
                    <div className="space-y-6">
                        {/* Slider */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm text-muted">Price Change</label>
                                <span
                                    className={cn(
                                        "text-lg font-bold tabular-nums",
                                        sliderValue > 0
                                            ? "text-green-400"
                                            : sliderValue < 0
                                                ? "text-red-400"
                                                : "text-white",
                                    )}
                                >
                                    {sliderValue > 0 ? "+" : ""}
                                    {sliderValue}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={-10}
                                max={15}
                                step={1}
                                value={sliderValue}
                                onChange={(e) => handleSimulate(Number(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-gold-500
                                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:shadow-md
                                           [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-600"
                            />
                            <div className="flex justify-between text-[10px] text-muted mt-1">
                                <span>-10%</span>
                                <span>0%</span>
                                <span>+15%</span>
                            </div>
                        </div>

                        {/* Results */}
                        {simLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="animate-spin text-gold-400" size={24} />
                            </div>
                        ) : simulation ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <SimBox
                                        label="Projected Revenue"
                                        value={formatCurrency(simulation.projectedRevenue)}
                                    />
                                    <SimBox
                                        label="Revenue Change"
                                        value={`${simulation.revenueDifference >= 0 ? "+" : ""}${formatCurrency(simulation.revenueDifference)}`}
                                        color={simulation.revenueDifference >= 0 ? "text-green-400" : "text-red-400"}
                                    />
                                    <SimBox
                                        label="Booking Impact"
                                        value={`${simulation.estimatedBookingChange >= 0 ? "+" : ""}${simulation.estimatedBookingChange} bookings`}
                                        color={simulation.estimatedBookingChange >= 0 ? "text-green-400" : "text-red-400"}
                                    />
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-sm text-muted leading-relaxed">
                                        {simulation.explanation}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <p className="text-sm text-muted text-center py-4">
                                Move the slider to simulate a price change
                            </p>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

/* ── Sub-components ── */

function KPIBox({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <GlassCard>
            <p className="text-xs text-muted mb-1">{label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", color || "text-white")}>{value}</p>
        </GlassCard>
    );
}

function InsightCard({ insight, index }: { insight: RevenueInsight; index: number }) {
    const sev = severityStyles[insight.severity] || severityStyles.LOW;
    const Icon = typeIcon[insight.type] || Info;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
        >
            <GlassCard>
                <div className="space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className={cn("p-2 rounded-lg", sev.bg)}>
                                <Icon className={cn("h-4 w-4", sev.text)} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white leading-tight">
                                    {insight.title}
                                </h3>
                                {insight.hallName && (
                                    <p className="text-[11px] text-muted mt-0.5">{insight.hallName}</p>
                                )}
                            </div>
                        </div>
                        <span
                            className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border whitespace-nowrap",
                                sev.bg,
                                sev.text,
                                sev.border,
                            )}
                        >
                            {insight.severity}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted leading-relaxed">{insight.description}</p>

                    {/* Recommendation */}
                    <div className="p-2.5 rounded-lg bg-gold-500/5 border border-gold-500/10">
                        <p className="text-xs text-gold-400 font-medium mb-0.5">Recommendation</p>
                        <p className="text-sm text-white/80">{insight.recommendation}</p>
                    </div>

                    {/* Impact */}
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted">Projected Impact</span>
                        <span className="text-xs font-semibold text-emerald-400">
                            {insight.projectedImpact}
                        </span>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

function SimBox({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-[11px] text-muted mb-1">{label}</p>
            <p className={cn("text-sm font-bold tabular-nums", color || "text-white")}>{value}</p>
        </div>
    );
}
