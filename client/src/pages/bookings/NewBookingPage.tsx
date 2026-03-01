import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    CalendarDays,
    Users,
    MapPin,
    IndianRupee,
    Clock,
    UserPlus,
    Search,
    Check,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import PageHeader from "@/components/ui/PageHeader";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { useBranchStore } from "@/stores/branchStore";
import toast from "react-hot-toast";
import type { Lead, Hall } from "@/types";

interface FormData {
    branchId: string;
    hallId: string;
    leadId: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    guestCount: string;
    totalAmount: string;
    advanceAmount: string;
    notes: string;
}

interface NewLeadForm {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    eventType: string;
    eventDate: string;
    guestCount: string;
}

const EVENT_TYPES = ["Wedding", "Corporate", "Birthday", "Reception", "Engagement", "Anniversary", "Conference", "Other"];

export default function NewBookingPage() {
    const navigate = useNavigate();
    const { branches } = useBranchStore();

    // Form state
    const [form, setForm] = useState<FormData>({
        branchId: "",
        hallId: "",
        leadId: "",
        startDate: "",
        endDate: "",
        startTime: "10:00",
        endTime: "22:00",
        guestCount: "",
        totalAmount: "",
        advanceAmount: "0",
        notes: "",
    });

    // Data loading
    const [halls, setHalls] = useState<Hall[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loadingHalls, setLoadingHalls] = useState(false);
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Lead search & creation
    const [leadSearch, setLeadSearch] = useState("");
    const [showNewLead, setShowNewLead] = useState(false);
    const [newLeadForm, setNewLeadForm] = useState<NewLeadForm>({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        eventType: "Wedding",
        eventDate: "",
        guestCount: "",
    });
    const [creatingLead, setCreatingLead] = useState(false);

    // Set default branch
    useEffect(() => {
        if (branches.length > 0 && !form.branchId) {
            // Use real API branches (non-demo ones) if available
            const realBranch = branches.find(b => !b.id.startsWith("demo-"));
            setForm(f => ({ ...f, branchId: realBranch?.id || branches[0].id }));
        }
    }, [branches]);

    // Fetch halls when branch changes
    useEffect(() => {
        if (!form.branchId) {
            setHalls([]);
            return;
        }
        setLoadingHalls(true);
        api.get(`/branches/${form.branchId}`, { timeout: 5000 })
            .then(res => {
                const branchData = res.data?.data;
                setHalls(branchData?.halls || []);
            })
            .catch(() => setHalls([]))
            .finally(() => setLoadingHalls(false));
    }, [form.branchId]);

    // Fetch leads based on selected branch
    useEffect(() => {
        if (!form.branchId) {
            setLeads([]);
            return;
        }
        setLoadingLeads(true);
        api.get("/leads", {
            timeout: 5000,
            params: {
                limit: 100,
                branchId: form.branchId // This will be handled by branchIsolation or LeadService
            }
        })
            .then(res => {
                // The API might return { success: true, data: [...], meta: {...} } 
                // or just { success: true, data: [...] }
                const leadData = res.data?.data?.data || res.data?.data || [];
                setLeads(Array.isArray(leadData) ? leadData : []);
            })
            .catch(() => setLeads([]))
            .finally(() => setLoadingLeads(false));
    }, [form.branchId]);

    // Filtered leads for search
    const filteredLeads = useMemo(() => {
        if (!leadSearch) return leads;
        const q = leadSearch.toLowerCase();
        return leads.filter(
            l =>
                l.customerName.toLowerCase().includes(q) ||
                l.customerPhone.includes(q) ||
                l.eventType?.toLowerCase().includes(q)
        );
    }, [leads, leadSearch]);

    const selectedLead = useMemo(
        () => leads.find(l => l.id === form.leadId),
        [leads, form.leadId]
    );

    const selectedHall = useMemo(
        () => halls.find(h => h.id === form.hallId),
        [halls, form.hallId]
    );

    // Update form helper
    const updateForm = (field: keyof FormData, value: string) => {
        setForm(f => {
            const newForm = { ...f, [field]: value };

            // Auto-sync end date
            if (field === "startDate" && !f.endDate) {
                newForm.endDate = value;
            }

            // Auto-populate from hall
            if (field === "hallId" && value) {
                const hall = halls.find(h => h.id === value);
                if (hall) {
                    newForm.totalAmount = String(hall.pricePerEvent);
                    newForm.guestCount = String(hall.capacity);
                }
            }

            return newForm;
        });
    };

    // Create a new lead via API
    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLeadForm.customerName || !newLeadForm.customerPhone) {
            toast.error("Name and phone are required");
            return;
        }
        setCreatingLead(true);
        try {
            const payload: Record<string, any> = {
                customerName: newLeadForm.customerName,
                customerPhone: newLeadForm.customerPhone,
                eventType: newLeadForm.eventType || "Wedding",
                branchId: form.branchId,
                assignedToId: "auto", // Will be set by server to current user
            };
            if (newLeadForm.customerEmail) payload.customerEmail = newLeadForm.customerEmail;
            if (newLeadForm.eventDate) payload.eventDate = new Date(newLeadForm.eventDate).toISOString();
            if (newLeadForm.guestCount) payload.guestCount = parseInt(newLeadForm.guestCount);

            const res = await api.post("/leads", payload, { timeout: 10000 });
            const created = res.data?.data;
            if (created?.id) {
                setLeads(prev => [created, ...prev]);
                setForm(f => ({ ...f, leadId: created.id }));
                toast.success(`Lead "${created.customerName}" created!`);
                setShowNewLead(false);
                setNewLeadForm({ customerName: "", customerPhone: "", customerEmail: "", eventType: "Wedding", eventDate: "", guestCount: "" });
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to create lead";
            toast.error(msg);
        } finally {
            setCreatingLead(false);
        }
    };

    // Submit booking
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!form.branchId) return toast.error("Select a branch");
        if (!form.hallId) return toast.error("Select a hall");
        if (!form.leadId) return toast.error("Select or create a customer lead");
        if (!form.startDate) return toast.error("Select a start date");
        if (!form.endDate) return toast.error("Select an end date");
        if (!form.guestCount || parseInt(form.guestCount) <= 0) return toast.error("Enter guest count");
        if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) return toast.error("Enter total amount");

        setSubmitting(true);
        try {
            const payload = {
                branchId: form.branchId,
                hallId: form.hallId,
                leadId: form.leadId,
                startDate: new Date(form.startDate).toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                startTime: form.startTime,
                endTime: form.endTime,
                guestCount: parseInt(form.guestCount),
                totalAmount: parseFloat(form.totalAmount),
                advanceAmount: parseFloat(form.advanceAmount || "0"),
                notes: form.notes || undefined,
            };

            const res = await api.post("/bookings", payload, { timeout: 15000 });
            if (res.data?.success) {
                toast.success(`Booking ${res.data.data?.bookingNumber || ""} created!`);
                navigate("/bookings");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || "Failed to create booking";
            toast.error(msg);
            console.error("Booking creation error:", err.response?.data || err);
        } finally {
            setSubmitting(false);
        }
    };

    const balance = (parseFloat(form.totalAmount || "0") - parseFloat(form.advanceAmount || "0"));

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn-ghost p-2">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <PageHeader
                    title="New Booking"
                    subtitle="Create a new event booking"
                    icon={CalendarDays}
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-3 gap-6">
                    {/* ── Left Column: Venue & Schedule ── */}
                    <div className="col-span-2 space-y-6">
                        {/* Branch & Hall */}
                        <GlassCard>
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gold-400" />
                                    Venue
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Branch *</label>
                                        <select
                                            value={form.branchId}
                                            onChange={e => {
                                                updateForm("branchId", e.target.value);
                                                setForm(f => ({ ...f, hallId: "" }));
                                            }}
                                            className="input-dark w-full"
                                        >
                                            <option value="">Select branch</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Hall *</label>
                                        <select
                                            value={form.hallId}
                                            onChange={e => updateForm("hallId", e.target.value)}
                                            className="input-dark w-full"
                                            disabled={loadingHalls || halls.length === 0}
                                        >
                                            <option value="">
                                                {loadingHalls ? "Loading halls..." : halls.length === 0 ? "No halls available" : "Select hall"}
                                            </option>
                                            {halls.map(h => (
                                                <option key={h.id} value={h.id}>
                                                    {h.name} (capacity: {h.capacity})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedHall && (
                                            <p className="text-[11px] text-gold-400/60 mt-1">
                                                Base price: {formatCurrency(selectedHall.pricePerEvent)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Date & Time */}
                        <GlassCard>
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gold-400" />
                                    Schedule
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Start Date *</label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={e => updateForm("startDate", e.target.value)}
                                            className="input-dark w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">End Date *</label>
                                        <input
                                            type="date"
                                            value={form.endDate}
                                            onChange={e => updateForm("endDate", e.target.value)}
                                            min={form.startDate}
                                            className="input-dark w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Start Time</label>
                                        <input
                                            type="time"
                                            value={form.startTime}
                                            onChange={e => updateForm("startTime", e.target.value)}
                                            className="input-dark w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">End Time</label>
                                        <input
                                            type="time"
                                            value={form.endTime}
                                            onChange={e => updateForm("endTime", e.target.value)}
                                            className="input-dark w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Guest & Financials */}
                        <GlassCard>
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4 text-gold-400" />
                                    Event Details
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Guest Count *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.guestCount}
                                            onChange={e => updateForm("guestCount", e.target.value)}
                                            placeholder="e.g. 200"
                                            className="input-dark w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Total Amount *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            value={form.totalAmount}
                                            onChange={e => updateForm("totalAmount", e.target.value)}
                                            placeholder="e.g. 500000"
                                            className="input-dark w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted mb-1.5">Advance Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.advanceAmount}
                                            onChange={e => updateForm("advanceAmount", e.target.value)}
                                            placeholder="0"
                                            className="input-dark w-full"
                                        />
                                    </div>
                                </div>
                                {parseFloat(form.totalAmount || "0") > 0 && (
                                    <div className="mt-3 p-3 rounded-xl bg-surface border border-border">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted">Balance Due</span>
                                            <span className={cn("font-semibold", balance > 0 ? "text-amber-400" : "text-green-400")}>
                                                {formatCurrency(Math.max(0, balance))}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Notes */}
                        <GlassCard>
                            <div className="p-5">
                                <label className="block text-xs text-muted mb-1.5">Notes (optional)</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => updateForm("notes", e.target.value)}
                                    placeholder="Any special requirements or instructions..."
                                    rows={3}
                                    className="input-dark w-full resize-none"
                                />
                            </div>
                        </GlassCard>
                    </div>

                    {/* ── Right Column: Customer (Lead) Selection ── */}
                    <div className="space-y-6">
                        <GlassCard>
                            <div className="p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gold-400" />
                                    Customer
                                </h3>

                                {/* Selected lead display */}
                                {selectedLead ? (
                                    <div className="p-3 rounded-xl bg-gold-500/5 border border-gold-500/20 mb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-white">{selectedLead.customerName}</p>
                                                <p className="text-xs text-muted">{selectedLead.customerPhone}</p>
                                                <p className="text-xs text-gold-400">{selectedLead.eventType}</p>
                                            </div>
                                            <Check className="h-4 w-4 text-gold-400" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, leadId: "" }))}
                                            className="text-xs text-muted hover:text-white mt-2"
                                        >
                                            Change customer
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search leads */}
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                            <input
                                                type="text"
                                                placeholder="Search existing leads..."
                                                value={leadSearch}
                                                onChange={e => setLeadSearch(e.target.value)}
                                                className="input-dark w-full pl-9"
                                            />
                                        </div>

                                        {/* Lead list */}
                                        <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
                                            {loadingLeads ? (
                                                <p className="text-xs text-muted text-center py-4">Loading leads...</p>
                                            ) : filteredLeads.length === 0 ? (
                                                <p className="text-xs text-muted text-center py-4">
                                                    {leadSearch ? "No matching leads" : "No leads found — create one below"}
                                                </p>
                                            ) : (
                                                filteredLeads.map(lead => (
                                                    <button
                                                        key={lead.id}
                                                        type="button"
                                                        onClick={() => setForm(f => ({ ...f, leadId: lead.id }))}
                                                        className={cn(
                                                            "w-full text-left p-2.5 rounded-lg transition-all",
                                                            form.leadId === lead.id
                                                                ? "bg-gold-500/10 border border-gold-500/20"
                                                                : "hover:bg-surface border border-transparent"
                                                        )}
                                                    >
                                                        <p className="text-sm text-white">{lead.customerName}</p>
                                                        <p className="text-xs text-muted">{lead.customerPhone} • {lead.eventType}</p>
                                                    </button>
                                                ))
                                            )}
                                        </div>

                                        {/* Create new lead toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setShowNewLead(!showNewLead)}
                                            className="btn-ghost w-full text-sm justify-center"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            {showNewLead ? "Cancel" : "New Customer"}
                                        </button>
                                    </>
                                )}

                                {/* Inline new lead form */}
                                {showNewLead && !selectedLead && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-3 p-4 rounded-xl bg-surface border border-border space-y-3"
                                    >
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Name *</label>
                                            <input
                                                type="text"
                                                value={newLeadForm.customerName}
                                                onChange={e => setNewLeadForm(f => ({ ...f, customerName: e.target.value }))}
                                                placeholder="Customer name"
                                                className="input-dark w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Phone *</label>
                                            <input
                                                type="tel"
                                                value={newLeadForm.customerPhone}
                                                onChange={e => setNewLeadForm(f => ({ ...f, customerPhone: e.target.value }))}
                                                placeholder="10-digit phone"
                                                className="input-dark w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={newLeadForm.customerEmail}
                                                onChange={e => setNewLeadForm(f => ({ ...f, customerEmail: e.target.value }))}
                                                placeholder="Optional"
                                                className="input-dark w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-muted mb-1">Event Type</label>
                                            <select
                                                value={newLeadForm.eventType}
                                                onChange={e => setNewLeadForm(f => ({ ...f, eventType: e.target.value }))}
                                                className="input-dark w-full"
                                            >
                                                {EVENT_TYPES.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Event Date</label>
                                                <input
                                                    type="date"
                                                    value={newLeadForm.eventDate}
                                                    onChange={e => setNewLeadForm(f => ({ ...f, eventDate: e.target.value }))}
                                                    className="input-dark w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Guests</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={newLeadForm.guestCount}
                                                    onChange={e => setNewLeadForm(f => ({ ...f, guestCount: e.target.value }))}
                                                    placeholder="Count"
                                                    className="input-dark w-full"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCreateLead}
                                            disabled={creatingLead}
                                            className="btn-gold w-full justify-center"
                                        >
                                            {creatingLead ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-black/20 border-t-black rounded-full" />
                                            ) : (
                                                <>
                                                    <UserPlus className="h-4 w-4" />
                                                    Create & Select
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Submit */}
                        <GlassCard>
                            <div className="p-5 space-y-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-gold w-full justify-center py-3 text-base"
                                >
                                    {submitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-black/20 border-t-black rounded-full" />
                                            Creating...
                                        </div>
                                    ) : (
                                        <>
                                            <CalendarDays className="h-5 w-5" />
                                            Create Booking
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="btn-ghost w-full justify-center"
                                >
                                    Cancel
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </form>
        </div>
    );
}
