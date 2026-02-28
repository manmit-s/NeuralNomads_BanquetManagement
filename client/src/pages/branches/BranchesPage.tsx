import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    Plus,
    MapPin,
    Phone,
    Users,
    Edit,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { cn, getInitials } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Branch {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    city?: string;
    state?: string;
    staffCount?: number;
    hallCount?: number;
    isActive: boolean;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: "", address: "", phone: "", city: "", state: "" });

    const loadBranches = useCallback(async () => {
        try {
            const { data } = await api.get("/branches");
            setBranches(data.data || data || []);
        } catch {
            // fallback
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/branches", form);
            toast.success("Branch created!");
            setShowModal(false);
            setForm({ name: "", address: "", phone: "", city: "", state: "" });
            loadBranches();
        } catch {
            toast.error("Failed to create branch");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Branches"
                subtitle="Manage your venues and locations"
                icon={Building2}
                action={
                    <button onClick={() => setShowModal(true)} className="btn-gold">
                        <Plus className="h-4 w-4" />
                        Add Branch
                    </button>
                }
            />

            {branches.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No branches yet"
                    description="Add your first branch to get started"
                />
            ) : (
                <div className="grid grid-cols-2 gap-5">
                    {branches.map((branch, i) => (
                        <motion.div
                            key={branch.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <GlassCard hover>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-gold-gradient flex items-center justify-center text-sm font-bold text-black">
                                                {getInitials(branch.name)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">{branch.name}</h3>
                                                {branch.city && (
                                                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-3 w-3" />
                                                        {branch.city}{branch.state ? `, ${branch.state}` : ""}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-medium px-2 py-0.5 rounded-md",
                                                branch.isActive
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            )}>
                                                {branch.isActive ? "Active" : "Inactive"}
                                            </span>
                                            <button className="btn-ghost p-1.5">
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {branch.address && (
                                        <p className="text-xs text-muted mb-3 leading-relaxed">{branch.address}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-muted">
                                        {branch.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {branch.phone}
                                            </span>
                                        )}
                                        {branch.staffCount !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {branch.staffCount} staff
                                            </span>
                                        )}
                                        {branch.hallCount !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Building2 className="h-3 w-3" />
                                                {branch.hallCount} halls
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Branch" size="md">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Branch Name</label>
                        <input
                            className="input-dark"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Address</label>
                        <textarea
                            className="input-dark min-h-[70px] resize-none"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">City</label>
                            <input
                                className="input-dark"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">State</label>
                            <input
                                className="input-dark"
                                value={form.state}
                                onChange={(e) => setForm({ ...form, state: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
                        <input
                            className="input-dark"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-gold">
                            Create Branch
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
