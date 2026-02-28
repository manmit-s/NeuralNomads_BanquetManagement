import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CalendarCheck,
    Clock,
    Users,
    Package,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import KPICard from "@/components/ui/KPICard";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useBranchStore } from "@/stores/branchStore";
import api from "@/lib/api";
import {
    DEMO_BRANCH_PERFORMANCE,
    DEMO_INVENTORY,
    DEMO_BOOKINGS,
    DEMO_LEADS,
    DEMO_HALLS,
} from "@/data/demo";

export default function DashboardPage() {
    const { selectedBranchId, branches } = useBranchStore();
    const [apiSummary, setApiSummary] = useState<any>(null);
    const [isDemo, setIsDemo] = useState(true);

    // Try to fetch dashboard summary from API
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const params: Record<string, string> = {};
                if (selectedBranchId) params.branchId = selectedBranchId;
                const res = await api.get("/reports/dashboard", { params, timeout: 5000 });
                if (!cancelled && res.data?.data) {
                    setApiSummary(res.data.data);
                    setIsDemo(false);
                }
            } catch {
                if (!cancelled) setIsDemo(true);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedBranchId]);

    const selectedBranchName = useMemo(() => {
        if (!selectedBranchId) return null;
        return branches.find((b) => b.id === selectedBranchId)?.name ?? null;
    }, [selectedBranchId, branches]);

    /* ── derive branchId for a booking via its hall ── */
    const hallBranchMap = useMemo(() => {
        const map = new Map<string, string>();
        DEMO_HALLS.forEach((h) => map.set(h.id, h.branchId));
        return map;
    }, []);

    /* ── filtered collections ── */
    const filteredBookings = useMemo(
        () =>
            selectedBranchId
                ? DEMO_BOOKINGS.filter((b) => hallBranchMap.get(b.hallId) === selectedBranchId)
                : DEMO_BOOKINGS,
        [selectedBranchId, hallBranchMap]
    );

    const filteredLeads = useMemo(
        () =>
            selectedBranchId
                ? DEMO_LEADS.filter((l) => l.branchId === selectedBranchId)
                : DEMO_LEADS,
        [selectedBranchId]
    );

    const filteredInventory = useMemo(
        () =>
            selectedBranchId
                ? DEMO_INVENTORY.filter((i) => i.branchId === selectedBranchId)
                : DEMO_INVENTORY,
        [selectedBranchId]
    );

    /* ── recompute KPIs — prefer API data, fallback to demo ── */
    const summary = useMemo(() => {
        if (!isDemo && apiSummary) return apiSummary;
        const confirmed = filteredBookings.filter((b) => b.status === "CONFIRMED");
        const now = new Date();
        const thisMonthLeads = filteredLeads.filter((l) => {
            const ld = new Date(l.createdAt);
            return ld.getMonth() === now.getMonth() && ld.getFullYear() === now.getFullYear();
        });
        return {
            monthlyRevenue: confirmed.reduce((s, b) => s + b.totalAmount, 0),
            totalOutstanding: filteredBookings.reduce((s, b) => s + b.balanceAmount, 0),
            totalLeadsThisMonth: thisMonthLeads.length,
            activeBookings: confirmed.length,
            upcomingEvents: filteredBookings.filter(
                (b) => b.status !== "CANCELLED" && b.status !== "COMPLETED"
            ).length,
        };
    }, [filteredBookings, filteredLeads, isDemo, apiSummary]);

    /* ── branch performance table (filter or show all) ── */
    const branchData = useMemo(
        () =>
            selectedBranchId
                ? DEMO_BRANCH_PERFORMANCE.filter((b) => b.branchId === selectedBranchId)
                : DEMO_BRANCH_PERFORMANCE,
        [selectedBranchId]
    );

    /* ── today's events from filtered bookings ── */
    const todayEvents = useMemo(() => {
        const now = new Date();
        return filteredBookings
            .filter((b) => {
                if (!b.eventDate) return false;
                const bd = new Date(b.eventDate);
                return (
                    bd.getDate() === now.getDate() &&
                    bd.getMonth() === now.getMonth() &&
                    bd.getFullYear() === now.getFullYear() &&
                    b.status !== "CANCELLED"
                );
            })
            .map((b) => ({
                time: `${b.startTime} - ${b.endTime}`,
                name: b.customerName,
                guests: b.guestCount,
                type: b.eventType,
                hall: b.hall?.name || "TBD",
            }));
    }, [filteredBookings]);

    const lowStockCount = filteredInventory.filter(
        (i) => i.currentStock < i.minimumStock
    ).length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Dashboard"
                subtitle={`${selectedBranchName ? selectedBranchName : "All Branches"} • ${formatDate(new Date())}`}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard
                    title="Monthly Revenue"
                    value={formatCurrency(summary.monthlyRevenue)}
                    change="+12.5%"
                    changeType="positive"
                    icon={DollarSign}
                    iconColor="text-green-400"
                />
                <KPICard
                    title="Outstanding"
                    value={formatCurrency(summary.totalOutstanding)}
                    change="-3.2%"
                    changeType="negative"
                    icon={AlertTriangle}
                    iconColor="text-red-400"
                />
                <KPICard
                    title="Leads This Month"
                    value={String(summary.totalLeadsThisMonth)}
                    change="+2.1%"
                    changeType="positive"
                    icon={TrendingUp}
                    iconColor="text-gold-400"
                />
                <KPICard
                    title="Active Bookings"
                    value={String(summary.activeBookings)}
                    change="+5"
                    changeType="positive"
                    icon={CalendarCheck}
                    iconColor="text-blue-400"
                />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Branch Performance Table */}
                <div className="xl:col-span-2">
                    <GlassCard padding={false}>
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="text-base font-semibold text-white">
                                Branch Performance
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Branch
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Bookings
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                            Trend
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {branchData.length > 0 ? (
                                        branchData.map((branch, i) => (
                                            <motion.tr
                                                key={branch.branchId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 text-xs font-bold">
                                                            {branch.branchName?.charAt(0) || "B"}
                                                        </div>
                                                        <span className="text-sm font-medium text-white">
                                                            {branch.branchName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white font-medium">
                                                    {formatCurrency(branch.totalRevenue)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted">
                                                    {branch.invoiceCount}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        {branch.trend}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted">
                                                No branch data yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    {/* Action Required */}
                    <GlassCard>
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-gold-400" />
                            Action Required
                        </h3>
                        <div className="space-y-3">
                            <ActionItem
                                icon={DollarSign}
                                label={`${filteredBookings.filter(b => b.balanceAmount > 0 && b.status === "CONFIRMED").length} outstanding payments`}
                                sublabel={formatCurrency(summary.totalOutstanding)}
                                color="text-red-400"
                                bgColor="bg-red-500/10"
                            />
                            <ActionItem
                                icon={Package}
                                label={`${lowStockCount} low stock items`}
                                sublabel="Needs reorder"
                                color="text-amber-400"
                                bgColor="bg-amber-500/10"
                            />
                            <ActionItem
                                icon={Users}
                                label={`${filteredLeads.filter(l => l.status === "CALL" || l.status === "VISIT").length} pending follow-ups`}
                                sublabel="Due today"
                                color="text-blue-400"
                                bgColor="bg-blue-500/10"
                            />
                        </div>
                    </GlassCard>

                    {/* Today's Events */}
                    <GlassCard>
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gold-400" />
                            Today&apos;s Events
                        </h3>
                        <div className="space-y-4">
                            {todayEvents.map((event, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-3"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 rounded-full bg-gold-500 mt-2" />
                                        {i < todayEvents.length - 1 && (
                                            <div className="w-px flex-1 bg-border mt-1" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="text-xs text-muted mb-1">{event.time}</p>
                                        <p className="text-sm font-medium text-white">
                                            {event.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <StatusBadge status={event.type === "Wedding" ? "CONFIRMED" : "UPCOMING"} label={event.type} />
                                            <span className="text-xs text-muted">
                                                {event.guests} guests • {event.hall}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

function ActionItem({
    icon: Icon,
    label,
    sublabel,
    color,
    bgColor,
}: {
    icon: typeof DollarSign;
    label: string;
    sublabel: string;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", bgColor)}>
                <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-muted">{sublabel}</p>
            </div>
            <ArrowDownRight className="h-4 w-4 text-muted" />
        </div>
    );
}
