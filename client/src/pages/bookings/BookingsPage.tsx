import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Plus,
    Search,
    Calendar,
    Users,
    IndianRupee,
    Eye,
    ChevronLeft,
    ChevronRight,
    XCircle,
    ClipboardList,
    Activity,
    ChefHat,
    Sparkles,
    Truck,
    UserCheck,
    Power,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import ResourceDrawer from "@/components/bookings/ResourceDrawer";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";
import { cn, formatCurrency } from "@/lib/utils";
import { DEMO_BOOKINGS } from "@/data/demo";
import { useApiWithFallback } from "@/lib/useApiWithFallback";
import { normalizeBookings } from "@/lib/normalizers";
import type { Booking } from "@/types";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import toast from "react-hot-toast";

/* ── Live Operations Panel (embedded in card) ── */
function LiveOpsPanel({
    booking,
    onUpdate,
    loading,
}: {
    booking: Booking;
    onUpdate: (id: string, field: string, val: boolean) => void;
    loading: boolean;
}) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    // Countdown / elapsed text
    const startMs = booking.eventDate
        ? new Date(`${booking.eventDate}T${booking.startTime || "00:00"}`).getTime()
        : 0;
    const diff = startMs - now;
    let timeText = "";
    if (diff > 0) {
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        timeText = `Starts in ${h}h ${m}m`;
    } else {
        timeText = "Event in progress";
    }

    const paidPct =
        booking.totalAmount && booking.totalAmount > 0
            ? Math.min(100, Math.round(((booking.paidAmount || 0) / booking.totalAmount) * 100))
            : 0;

    const toggles: { label: string; icon: React.ReactNode; field: string; value: boolean }[] = [
        { label: "Kitchen", icon: <ChefHat className="h-4 w-4" />, field: "kitchenReady", value: !!booking.kitchenReady },
        { label: "Décor", icon: <Sparkles className="h-4 w-4" />, field: "decorationReady", value: !!booking.decorationReady },
        { label: "Vendors", icon: <Truck className="h-4 w-4" />, field: "vendorsConfirmed", value: !!booking.vendorsConfirmed },
        { label: "Staff", icon: <UserCheck className="h-4 w-4" />, field: "staffAssigned", value: !!booking.staffAssigned },
    ];

    return (
        <div className="border-t border-white/5 px-5 py-4 bg-white/[0.02] space-y-3">
            {/* Top row: countdown + payment */}
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {timeText}
                </span>
                <span className="text-muted">
                    Payment: <span className={cn("font-semibold", paidPct >= 100 ? "text-green-400" : paidPct >= 50 ? "text-yellow-400" : "text-red-400")}>{paidPct}%</span>
                </span>
            </div>

            {/* Toggle buttons */}
            <div className="flex items-center gap-2 flex-wrap">
                {toggles.map((t) => (
                    <button
                        key={t.field}
                        onClick={(e) => { e.stopPropagation(); onUpdate(booking.id, t.field, !t.value); }}
                        disabled={loading}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all disabled:opacity-50",
                            t.value
                                ? "bg-green-600/20 border-green-500/30 text-green-400"
                                : "bg-white/5 border-white/10 text-muted hover:text-white"
                        )}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Close Event */}
            <button
                onClick={(e) => { e.stopPropagation(); onUpdate(booking.id, "eventClosed", true); }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 transition-all disabled:opacity-50"
            >
                <Power className="h-3.5 w-3.5" />
                Close Event
            </button>
        </div>
    );
}

export default function BookingsPage() {
    const navigate = useNavigate();
    const { data: bookingsData, refetch } = useApiWithFallback<Booking[]>("/bookings", DEMO_BOOKINGS, { transform: normalizeBookings });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const [updating, setUpdating] = useState(false);
    const [resourceBookingId, setResourceBookingId] = useState<string | null>(null);
    const [resourceDrawerOpen, setResourceDrawerOpen] = useState(false);
    const [expandedLive, setExpandedLive] = useState<string | null>(null);
    const [opsLoading, setOpsLoading] = useState(false);
    const limit = 15;

    const handleCancel = async (bookingId: string) => {
        setUpdating(true);
        try {
            await api.patch(`/bookings/${bookingId}`, { status: "CANCELLED" });
            toast.success("Booking cancelled");
            refetch();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to cancel");
        } finally {
            setUpdating(false);
        }
    };

    const handleLiveOps = async (bookingId: string, field: string, value: boolean) => {
        setOpsLoading(true);
        try {
            await api.patch(`/bookings/${bookingId}/live-ops`, { [field]: value });
            toast.success(field === "eventClosed" ? "Event closed" : "Updated");
            refetch();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update");
        } finally {
            setOpsLoading(false);
        }
    };

    const allBookings = useMemo(() => {
        let filtered = [...bookingsData];
        if (statusFilter !== "ALL") filtered = filtered.filter((b) => b.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    (b.customerName || "").toLowerCase().includes(q) ||
                    (b.eventType || "").toLowerCase().includes(q) ||
                    (b.bookingNumber || "").toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [bookingsData, statusFilter, search]);

    const total = allBookings.length;
    const totalPages = Math.ceil(total / limit);
    const bookings = allBookings.slice((page - 1) * limit, page * limit);

    const statuses = ["ALL", "CONFIRMED", "TENTATIVE", "LIVE", "COMPLETED", "CANCELLED"];

    return (
        <div>
            <PageHeader
                title="Bookings"
                subtitle="Manage all event bookings"
                icon={BookOpen}
                action={
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="input-dark pl-9 w-60"
                            />
                        </div>
                        <button
                            onClick={() => navigate("/bookings/new")}
                            className="btn-gold"
                        >
                            <Plus className="h-4 w-4" />
                            New Booking
                        </button>
                    </div>
                }
            />

            {/* Status Tabs */}
            <div className="flex gap-1 mb-6 bg-surface/50 p-1 rounded-xl w-fit">
                {statuses.map((s) => (
                    <button
                        key={s}
                        onClick={() => {
                            setStatusFilter(s);
                            setPage(1);
                        }}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            statusFilter === s
                                ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                : "text-muted hover:text-white"
                        )}
                    >
                        {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {bookings.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No bookings found"
                    description="Create your first booking to get started"
                />
            ) : (
                <>
                    <div className="space-y-3">
                        {bookings.map((booking, i) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <GlassCard hover>
                                    <div className="flex items-center justify-between p-5">
                                        <div className="flex items-center gap-5">
                                            {/* Date Block */}
                                            <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-gold-500/10 border border-gold-500/20">
                                                <Calendar className="h-4 w-4 text-gold-400 mb-0.5" />
                                                <span className="text-[10px] text-gold-400 font-medium">
                                                    {booking.eventDate
                                                        ? new Date(booking.eventDate).toLocaleDateString("en", { month: "short", day: "numeric" })
                                                        : "TBD"}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-white">
                                                        {booking.customerName}
                                                    </h3>
                                                    <StatusBadge status={booking.status} />
                                                    {booking.healthScore !== undefined && (
                                                        <div className="relative group/health">
                                                            <span
                                                                className={cn(
                                                                    "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full cursor-default whitespace-nowrap",
                                                                    booking.healthScore >= 80
                                                                        ? "bg-green-500/10 text-green-400"
                                                                        : booking.healthScore >= 60
                                                                            ? "bg-yellow-500/10 text-yellow-400"
                                                                            : "bg-red-500/10 text-red-400"
                                                                )}
                                                            >
                                                                <Activity className="h-3 w-3" />
                                                                {booking.healthScore}% – {booking.healthLabel}
                                                            </span>
                                                            {booking.healthBreakdown && (
                                                                <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover/health:block w-[260px] p-3 rounded-lg bg-slate-800 border border-white/10 shadow-2xl text-xs">
                                                                    <p className="text-white font-semibold mb-2">Health Breakdown</p>
                                                                    {([
                                                                        ["Payment", booking.healthBreakdown.payment, 25],
                                                                        ["Vendor", booking.healthBreakdown.vendor, 15],
                                                                        ["Menu", booking.healthBreakdown.menu, 15],
                                                                        ["Guest Count", booking.healthBreakdown.guest, 10],
                                                                        ["Stock", booking.healthBreakdown.stock, 20],
                                                                        ["Follow-ups", booking.healthBreakdown.followUps, 15],
                                                                    ] as [string, number, number][]).map(([label, val, max]) => (
                                                                        <div key={label} className="flex items-center justify-between py-0.5">
                                                                            <span className="text-muted">{label}</span>
                                                                            <span className={cn(
                                                                                "font-medium tabular-nums",
                                                                                val >= max ? "text-green-400" : val > 0 ? "text-yellow-400" : "text-red-400"
                                                                            )}>
                                                                                {val}/{max}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />
                                                        {booking.eventType}
                                                    </span>
                                                    {booking.guestCount && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {booking.guestCount} guests
                                                        </span>
                                                    )}
                                                    {booking.hall && (
                                                        <span className="text-gold-400/60">
                                                            {booking.hall.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {booking.totalAmount && (
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-white flex items-center gap-1">
                                                        <IndianRupee className="h-3.5 w-3.5" />
                                                        {formatCurrency(booking.totalAmount)}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        Paid: {formatCurrency(booking.paidAmount || 0)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Cancel button for TENTATIVE */}
                                            {booking.status === "TENTATIVE" && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(booking.id); }}
                                                    disabled={updating}
                                                    className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-all disabled:opacity-50"
                                                    title="Cancel booking"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}

                                            {/* Resource planner for CONFIRMED */}
                                            {booking.status === "CONFIRMED" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setResourceBookingId(booking.id);
                                                        setResourceDrawerOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 transition-all"
                                                    title="Resource Planner"
                                                >
                                                    <ClipboardList className="h-4 w-4" />
                                                </button>
                                            )}

                                            {/* Expand live panel toggle */}
                                            {booking.status === "LIVE" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedLive(expandedLive === booking.id ? null : booking.id);
                                                    }}
                                                    className="p-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 transition-all"
                                                    title="Live Operations"
                                                >
                                                    {expandedLive === booking.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => navigate(`/events/${booking.id}`)}
                                                className="btn-ghost p-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Live Operations Panel */}
                                    {booking.status === "LIVE" && expandedLive === booking.id && (
                                        <LiveOpsPanel
                                            booking={booking}
                                            onUpdate={handleLiveOps}
                                            loading={opsLoading}
                                        />
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-muted">
                                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-ghost p-2 disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const p = i + 1;
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={cn(
                                                "h-8 w-8 rounded-lg text-sm font-medium transition-all",
                                                page === p
                                                    ? "bg-gold-500 text-black"
                                                    : "text-muted hover:text-white hover:bg-surface"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-ghost p-2 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <ResourceDrawer
                bookingId={resourceBookingId}
                bookingLabel={bookingsData.find((b) => b.id === resourceBookingId)?.bookingNumber}
                open={resourceDrawerOpen}
                onClose={() => {
                    setResourceDrawerOpen(false);
                    setResourceBookingId(null);
                }}
            />
        </div>
    );
}
