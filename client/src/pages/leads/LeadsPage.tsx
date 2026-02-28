import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Plus,
    Search,
    Phone,
    Calendar,
    User,
    GripVertical,
    Filter,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { cn, formatDate, EVENT_TYPE_COLORS, LEAD_STATUS_LABELS } from "@/lib/utils";
import { DEMO_LEADS } from "@/data/demo";
import { useApiWithFallback } from "@/lib/useApiWithFallback";
import type { Lead, LeadStatus } from "@/types";
import toast from "react-hot-toast";

const KANBAN_COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
    { status: "CALL", label: "New Inquiry", color: "border-t-blue-500" },
    { status: "VISIT", label: "Visit Done", color: "border-t-purple-500" },
    { status: "TASTING", label: "Tasting", color: "border-t-amber-500" },
    { status: "ADVANCE", label: "Converted", color: "border-t-green-500" },
    { status: "LOST", label: "Lost", color: "border-t-red-500" },
];

export default function LeadsPage() {
    const { data: apiLeads, loading } = useApiWithFallback<Lead[]>("/leads", DEMO_LEADS);
    const [leads, setLeads] = useState<Lead[]>(apiLeads);

    // Sync when API data arrives
    useEffect(() => { setLeads(apiLeads); }, [apiLeads]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);

    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        eventType: "Wedding",
        eventDate: "",
        guestCount: "",
        notes: "",
        branchId: "",
    });

    const getColumnLeads = (status: LeadStatus) =>
        leads
            .filter((l) => l.status === status)
            .filter((l) =>
                search
                    ? l.customerName.toLowerCase().includes(search.toLowerCase()) ||
                    l.eventType?.toLowerCase().includes(search.toLowerCase())
                    : true
            );

    const handleDragStart = (lead: Lead) => {
        setDraggedLead(lead);
    };

    const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleDrop = async (status: LeadStatus) => {
        if (!draggedLead || draggedLead.status === status) {
            setDraggedLead(null);
            setDragOverColumn(null);
            return;
        }

        // Optimistic update
        setLeads((prev) =>
            prev.map((l) => (l.id === draggedLead.id ? { ...l, status } : l))
        );
        setDraggedLead(null);
        setDragOverColumn(null);
        toast.success(`Lead moved to ${LEAD_STATUS_LABELS[status] || status}`);
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: `demo-new-${Date.now()}`,
            customerName: form.customerName,
            customerPhone: form.customerPhone,
            customerEmail: form.customerEmail || undefined,
            eventType: form.eventType,
            eventDate: form.eventDate || undefined,
            guestCount: form.guestCount ? parseInt(form.guestCount) : undefined,
            notes: form.notes || undefined,
            status: "CALL" as LeadStatus,
            branchId: form.branchId || "demo-001",
            createdAt: new Date().toISOString(),
        };
        setLeads((prev) => [newLead, ...prev]);
        toast.success("Lead created!");
        setShowModal(false);
        setForm({ customerName: "", customerPhone: "", customerEmail: "", eventType: "Wedding", eventDate: "", guestCount: "", notes: "", branchId: "" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-7rem)]">
            <PageHeader
                title="Leads Pipeline"
                subtitle="Manage your sales pipeline"
                icon={Users}
                action={
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-dark pl-9 w-60"
                            />
                        </div>
                        <button className="btn-ghost">
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                        <button onClick={() => setShowModal(true)} className="btn-gold">
                            <Plus className="h-4 w-4" />
                            New Inquiry
                        </button>
                    </div>
                }
            />

            {/* Kanban Board */}
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((col) => {
                    const columnLeads = getColumnLeads(col.status);
                    return (
                        <div
                            key={col.status}
                            className={cn(
                                "flex flex-col min-w-[280px] flex-1 bg-surface/50 rounded-2xl border-t-2",
                                col.color,
                                dragOverColumn === col.status && "ring-1 ring-gold-500/30"
                            )}
                            onDragOver={(e) => handleDragOver(e, col.status)}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={() => handleDrop(col.status)}
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between px-4 py-3">
                                <h3 className="text-sm font-semibold text-white">{col.label}</h3>
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-muted">
                                    {columnLeads.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {columnLeads.map((lead) => (
                                        <LeadCard
                                            key={lead.id}
                                            lead={lead}
                                            onDragStart={() => handleDragStart(lead)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Lead Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Inquiry" size="md">
                <form onSubmit={handleCreateLead} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Client Name</label>
                            <input
                                className="input-dark"
                                value={form.customerName}
                                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
                            <input
                                className="input-dark"
                                value={form.customerPhone}
                                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
                        <input
                            className="input-dark"
                            type="email"
                            value={form.customerEmail}
                            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Event Type</label>
                            <select
                                className="input-dark"
                                value={form.eventType}
                                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                            >
                                <option>Wedding</option>
                                <option>Corporate</option>
                                <option>Birthday</option>
                                <option>Reception</option>
                                <option>Anniversary</option>
                                <option>Conference</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Event Date</label>
                            <input
                                className="input-dark"
                                type="date"
                                value={form.eventDate}
                                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Guest Count</label>
                        <input
                            className="input-dark"
                            type="number"
                            value={form.guestCount}
                            onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Notes</label>
                        <textarea
                            className="input-dark min-h-[80px] resize-none"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-gold">
                            Create Lead
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function LeadCard({ lead, onDragStart }: { lead: Lead; onDragStart: () => void }) {
    const eventColor = EVENT_TYPE_COLORS[lead.eventType] || EVENT_TYPE_COLORS.Other;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            draggable
            onDragStart={onDragStart}
            className="bg-card border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-gold-500/20 transition-all group"
        >
            {/* Event type badge */}
            <div className="flex items-center justify-between mb-3">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", eventColor)}>
                    {lead.eventType}
                </span>
                <GripVertical className="h-4 w-4 text-muted/30 group-hover:text-muted transition-colors" />
            </div>

            {/* Client name */}
            <p className="text-sm font-semibold text-white mb-2">{lead.customerName}</p>

            {/* Details */}
            <div className="space-y-1.5">
                {lead.eventDate && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(lead.eventDate)}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted">
                    <Phone className="h-3 w-3" />
                    <span>{lead.customerPhone}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                {lead.guestCount && (
                    <span className="text-xs text-muted">{lead.guestCount} guests</span>
                )}
                {lead.assignedTo && (
                    <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-gold-500/20 flex items-center justify-center">
                            <User className="h-3 w-3 text-gold-400" />
                        </div>
                        <span className="text-xs text-muted">{lead.assignedTo.name}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
