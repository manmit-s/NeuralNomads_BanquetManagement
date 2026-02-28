import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CalendarDays,
    Users,
    MapPin,
    IndianRupee,
    Clock,
    Phone,
    Mail,
    CheckCircle2,
    Circle,
    Plus,
    Edit,
    Utensils,
    Truck,
    CreditCard,
    ClipboardList,
    Info,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassCard from "@/components/ui/GlassCard";
import Modal from "@/components/ui/Modal";
import { cn, formatDate, formatCurrency, getInitials } from "@/lib/utils";
import api from "@/lib/api";
import type { Booking } from "@/types";
import toast from "react-hot-toast";

type Tab = "overview" | "menu" | "vendors" | "payments" | "checklist";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "menu", label: "Menu", icon: Utensils },
    { id: "vendors", label: "Vendors", icon: Truck },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "checklist", label: "Checklist", icon: ClipboardList },
];

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    const loadBooking = useCallback(async () => {
        if (!id) return;
        try {
            const { data } = await api.get(`/bookings/${id}`);
            setBooking(data.data || data);
        } catch {
            toast.error("Failed to load booking");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadBooking();
    }, [loadBooking]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-20">
                <p className="text-muted">Booking not found</p>
                <button onClick={() => navigate("/bookings")} className="btn-ghost mt-4">
                    Back to Bookings
                </button>
            </div>
        );
    }

    const paidPercent = booking.totalAmount
        ? Math.round(((booking.paidAmount || 0) / booking.totalAmount) * 100)
        : 0;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn-ghost p-2">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-display font-bold text-white">
                            {booking.customerName}
                        </h1>
                        <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-muted mt-1">
                        {booking.eventType} • Booking #{booking.id.slice(0, 8)}
                    </p>
                </div>
                <button className="btn-outline">
                    <Edit className="h-4 w-4" />
                    Edit
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <QuickStat
                    icon={CalendarDays}
                    label="Event Date"
                    value={booking.eventDate ? formatDate(booking.eventDate) : "TBD"}
                />
                <QuickStat
                    icon={Users}
                    label="Guests"
                    value={booking.guestCount ? `${booking.guestCount}` : "TBD"}
                />
                <QuickStat
                    icon={MapPin}
                    label="Hall"
                    value={booking.hall?.name || "Not assigned"}
                />
                <QuickStat
                    icon={IndianRupee}
                    label="Total"
                    value={booking.totalAmount ? formatCurrency(booking.totalAmount) : "TBD"}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-surface/50 p-1 rounded-xl w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === tab.id
                                ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                : "text-muted hover:text-white"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === "overview" && <OverviewTab booking={booking} paidPercent={paidPercent} />}
                {activeTab === "menu" && <MenuTab booking={booking} />}
                {activeTab === "vendors" && <VendorsTab booking={booking} />}
                {activeTab === "payments" && <PaymentsTab booking={booking} paidPercent={paidPercent} onRefresh={loadBooking} />}
                {activeTab === "checklist" && <ChecklistTab booking={booking} />}
            </motion.div>
        </div>
    );
}

function QuickStat({
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
                <div className="h-10 w-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
}

/* ── Overview Tab ─── */
function OverviewTab({ booking, paidPercent }: { booking: Booking; paidPercent: number }) {
    return (
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
                {/* Client Details */}
                <GlassCard>
                    <div className="p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">Client Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField icon={Phone} label="Phone" value={booking.customerPhone} />
                            <InfoField icon={Mail} label="Email" value={booking.customerEmail || "—"} />
                            <InfoField icon={Clock} label="Time" value={booking.startTime ? `${booking.startTime} – ${booking.endTime || ""}` : "TBD"} />
                            <InfoField icon={MapPin} label="Hall" value={booking.hall?.name || "Not assigned"} />
                        </div>
                    </div>
                </GlassCard>

                {/* Notes */}
                {booking.notes && (
                    <GlassCard>
                        <div className="p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Notes</h3>
                            <p className="text-sm text-muted leading-relaxed">{booking.notes}</p>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Payment Summary */}
            <GlassCard>
                <div className="p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Payment Summary</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted">Paid</span>
                                <span className="text-white font-medium">{paidPercent}%</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gold-gradient rounded-full transition-all"
                                    style={{ width: `${paidPercent}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted">Total</span>
                                <span className="text-white">{formatCurrency(booking.totalAmount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Paid</span>
                                <span className="text-green-400">{formatCurrency(booking.paidAmount || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="text-muted">Balance</span>
                                <span className="text-danger font-medium">
                                    {formatCurrency((booking.totalAmount || 0) - (booking.paidAmount || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

function InfoField({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 text-muted mt-0.5" />
            <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="text-sm text-white">{value}</p>
            </div>
        </div>
    );
}

/* ── Menu Tab ─── */
function MenuTab({ booking }: { booking: Booking }) {
    const menuItems = (booking as any).menuItems || [];

    return (
        <GlassCard>
            <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-white">Menu Items</h3>
                    <button className="btn-ghost text-xs">
                        <Plus className="h-3 w-3" />
                        Add Item
                    </button>
                </div>

                {menuItems.length === 0 ? (
                    <p className="text-sm text-muted py-8 text-center">
                        No menu items added yet
                    </p>
                ) : (
                    <div className="space-y-2">
                        {menuItems.map((item: any, i: number) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <Utensils className="h-4 w-4 text-gold-400" />
                                    <div>
                                        <p className="text-sm text-white">{item.name}</p>
                                        <p className="text-xs text-muted">{item.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-white font-medium">
                                    {formatCurrency(item.price || 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

/* ── Vendors Tab ─── */
function VendorsTab({ booking }: { booking: Booking }) {
    const vendors = (booking as any).vendors || [];

    return (
        <GlassCard>
            <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-white">Assigned Vendors</h3>
                    <button className="btn-ghost text-xs">
                        <Plus className="h-3 w-3" />
                        Add Vendor
                    </button>
                </div>

                {vendors.length === 0 ? (
                    <p className="text-sm text-muted py-8 text-center">
                        No vendors assigned yet
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {vendors.map((vendor: any, i: number) => (
                            <div
                                key={i}
                                className="p-4 rounded-xl bg-surface border border-border"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-9 w-9 rounded-lg bg-gold-500/10 flex items-center justify-center text-xs font-bold text-gold-400">
                                        {getInitials(vendor.name)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{vendor.name}</p>
                                        <p className="text-xs text-muted">{vendor.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted">{vendor.phone}</span>
                                    <StatusBadge status={vendor.status || "CONFIRMED"} size="sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

/* ── Payments Tab ─── */
function PaymentsTab({
    booking,
    paidPercent,
    onRefresh,
}: {
    booking: Booking;
    paidPercent: number;
    onRefresh: () => void;
}) {
    const [showPayModal, setShowPayModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("Cash");
    const payments = (booking as any).payments || [];

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/bookings/${booking.id}/payments`, {
                amount: parseFloat(amount),
                paymentMethod: method,
            });
            toast.success("Payment recorded");
            setShowPayModal(false);
            setAmount("");
            onRefresh();
        } catch {
            toast.error("Failed to record payment");
        }
    };

    return (
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
                <GlassCard>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-semibold text-white">Payment History</h3>
                            <button onClick={() => setShowPayModal(true)} className="btn-gold text-xs">
                                <Plus className="h-3 w-3" />
                                Record Payment
                            </button>
                        </div>

                        {payments.length === 0 ? (
                            <p className="text-sm text-muted py-8 text-center">
                                No payments recorded yet
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {payments.map((p: any, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <IndianRupee className="h-4 w-4 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white">{formatCurrency(p.amount)}</p>
                                                <p className="text-xs text-muted">{p.paymentMethod} • {formatDate(p.createdAt)}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={p.status || "COMPLETED"} size="sm" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Breakdown */}
            <GlassCard>
                <div className="p-5 space-y-5">
                    <h3 className="text-sm font-semibold text-white">Breakdown</h3>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted">Progress</span>
                            <span className="text-gold-400 font-medium">{paidPercent}%</span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gold-gradient rounded-full"
                                style={{ width: `${paidPercent}%` }}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted">Total</span>
                            <span className="text-white">{formatCurrency(booking.totalAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Received</span>
                            <span className="text-green-400">{formatCurrency(booking.paidAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2">
                            <span className="text-muted">Balance</span>
                            <span className="text-danger font-semibold">
                                {formatCurrency((booking.totalAmount || 0) - (booking.paidAmount || 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Add Payment Modal */}
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment" size="sm">
                <form onSubmit={handleAddPayment} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Amount</label>
                        <input
                            className="input-dark"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Method</label>
                        <select
                            className="input-dark"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <option>Cash</option>
                            <option>UPI</option>
                            <option>Bank Transfer</option>
                            <option>Card</option>
                            <option>Cheque</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowPayModal(false)} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-gold">
                            Record
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/* ── Checklist Tab ─── */
function ChecklistTab({ booking }: { booking: Booking }) {
    const checklist = (booking as any).checklist || [
        { label: "Advance payment received", done: true },
        { label: "Menu finalized", done: false },
        { label: "Decoration confirmed", done: false },
        { label: "DJ / Band booked", done: false },
        { label: "Photography confirmed", done: false },
        { label: "Catering team briefed", done: false },
        { label: "Final guest count confirmed", done: false },
        { label: "Venue walkthrough done", done: false },
    ];

    const [items, setItems] = useState(checklist);

    const toggle = (idx: number) => {
        setItems((prev: any[]) =>
            prev.map((item: any, i: number) =>
                i === idx ? { ...item, done: !item.done } : item
            )
        );
    };

    const doneCount = items.filter((i: any) => i.done).length;

    return (
        <GlassCard>
            <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-white">Event Checklist</h3>
                    <span className="text-xs text-muted">
                        {doneCount}/{items.length} completed
                    </span>
                </div>

                {/* Progress */}
                <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-5">
                    <div
                        className="h-full bg-gold-gradient rounded-full transition-all"
                        style={{ width: `${(doneCount / items.length) * 100}%` }}
                    />
                </div>

                <div className="space-y-1">
                    {items.map((item: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => toggle(idx)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-surface/80 transition-colors text-left"
                        >
                            {item.done ? (
                                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted/40 flex-shrink-0" />
                            )}
                            <span
                                className={cn(
                                    "text-sm",
                                    item.done ? "text-muted line-through" : "text-white"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}
