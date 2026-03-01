import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Receipt,
    IndianRupee,
    Calendar,
    FileText,
    CreditCard
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import type { Invoice } from "@/types";

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modal state for recording payments
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [paymentType, setPaymentType] = useState("PARTIAL");
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);

    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, unknown> = {};
            if (statusFilter !== "ALL") params.status = statusFilter;
            const { data } = await api.get("/billing/invoices", { params });
            setInvoices(data.data || []);
        } catch {
            // fallback
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const statuses = ["ALL", "DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"];

    const handleRecordPayment = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setPaymentAmount((invoice.totalAmount - (invoice.paidAmount || 0)).toString());
        setIsPaymentModalOpen(true);
    };

    const submitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;
        setPaymentSubmitting(true);
        try {
            await api.post("/billing/payments", {
                invoiceId: selectedInvoice.id,
                amount: parseFloat(paymentAmount),
                method: paymentMethod,
                type: paymentType,
            });
            setIsPaymentModalOpen(false);
            loadInvoices();
        } catch (error) {
            console.error(error);
        } finally {
            setPaymentSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Payment & Invoices"
                subtitle="Manage your billing and upcoming payments"
                icon={Receipt}
            />

            {/* Status Tabs */}
            <div className="flex gap-1 mb-6 bg-surface/50 p-1 rounded-xl w-fit overflow-x-auto max-w-full">
                {statuses.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                            statusFilter === s
                                ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                : "text-muted hover:text-white"
                        )}
                    >
                        {s === "ALL" ? "All" : s.replace("_", " ")}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full" />
                </div>
            ) : invoices.length === 0 ? (
                <EmptyState
                    icon={Receipt}
                    title="No invoices found"
                    description="There are no invoices matching your criteria."
                />
            ) : (
                <div className="space-y-3">
                    {invoices.map((invoice, i) => (
                        <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <GlassCard hover>
                                <div className="flex items-center justify-between p-5 text-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-gold-500/10 border border-gold-500/20">
                                            <FileText className="h-4 w-4 text-gold-400 mb-0.5" />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-sm font-semibold text-white">
                                                    {invoice.invoiceNumber}
                                                </h3>
                                                <StatusBadge status={invoice.status} />
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                                </span>
                                                {invoice.booking?.bookingNumber && (
                                                    <span className="text-gold-400/60">
                                                        Booking: {invoice.booking.bookingNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-white flex items-center justify-end gap-1">
                                                <IndianRupee className="h-3 w-3" />
                                                {formatCurrency(invoice.totalAmount)}
                                            </p>
                                            <p className="text-xs text-muted">
                                                Paid: {formatCurrency(invoice.paidAmount)}
                                            </p>
                                        </div>

                                        {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                                            <button
                                                onClick={() => handleRecordPayment(invoice)}
                                                className="btn-gold p-2 !px-3 !py-1.5 whitespace-nowrap text-xs"
                                            >
                                                <CreditCard className="h-3 w-3" /> Record Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Record Payment"
            >
                {selectedInvoice && (
                    <form onSubmit={submitPayment} className="space-y-4">
                        <div className="bg-surface/50 p-4 rounded-xl mb-4 border border-border/50 text-sm">
                            <p className="text-muted mb-1">Invoice <span className="text-white font-medium">{selectedInvoice.invoiceNumber}</span></p>
                            <div className="flex justify-between">
                                <span className="text-muted">Total Amount</span>
                                <span className="text-white font-medium">{formatCurrency(selectedInvoice.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Amount Paid</span>
                                <span className="text-emerald-400">{formatCurrency(selectedInvoice.paidAmount)}</span>
                            </div>
                            <div className="flex justify-between mt-2 pt-2 border-t border-border">
                                <span className="text-gold-400">Balance Due</span>
                                <span className="text-gold-400 font-bold">
                                    {formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedInvoice.totalAmount - selectedInvoice.paidAmount + 1} // +1 to avoid float rounding bugs max check
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="input-dark w-full"
                                    step="0.01"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted mb-1">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="input-dark w-full"
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CARD">Card</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CHEQUE">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted mb-1">Payment Type</label>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        className="input-dark w-full"
                                    >
                                        <option value="ADVANCE">Advance</option>
                                        <option value="PARTIAL">Partial</option>
                                        <option value="FULL">Full</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-muted hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={paymentSubmitting}
                                className="btn-gold"
                            >
                                {paymentSubmitting ? "Saving..." : "Record Payment"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
