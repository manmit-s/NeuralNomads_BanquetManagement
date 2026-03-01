import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    RefreshCw,
    Save,
    Users,
    Armchair,
    UtensilsCrossed,
    Package,
    Pencil,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { useBookingResources } from "@/lib/useBookingResources";
import type { BookingResource, ResourceCategory } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ResourceDrawerProps {
    bookingId: string | null;
    bookingLabel?: string;
    open: boolean;
    onClose: () => void;
}

const CATEGORY_META: Record<ResourceCategory, { label: string; icon: typeof Users; color: string }> = {
    STAFF: { label: "Staff", icon: Users, color: "text-blue-400" },
    FURNITURE: { label: "Furniture", icon: Armchair, color: "text-amber-400" },
    FOOD: { label: "Food & Ingredients", icon: UtensilsCrossed, color: "text-green-400" },
    OTHER: { label: "Other", icon: Package, color: "text-purple-400" },
};

const CATEGORY_ORDER: ResourceCategory[] = ["STAFF", "FURNITURE", "FOOD", "OTHER"];

export default function ResourceDrawer({ bookingId, bookingLabel, open, onClose }: ResourceDrawerProps) {
    const { resources, loading, saving, error, save, recalculate } = useBookingResources(
        open ? bookingId : null
    );

    // Local editable state — mirrors resources but tracks user edits
    const [edits, setEdits] = useState<Map<string, number>>(new Map());
    const [dirty, setDirty] = useState(false);

    // Reset edits when resources reload
    useEffect(() => {
        setEdits(new Map());
        setDirty(false);
    }, [resources]);

    const grouped = useMemo(() => {
        const groups: Record<ResourceCategory, BookingResource[]> = {
            STAFF: [],
            FURNITURE: [],
            FOOD: [],
            OTHER: [],
        };
        for (const r of resources) {
            (groups[r.category] ?? groups.OTHER).push(r);
        }
        return groups;
    }, [resources]);

    const handleQtyChange = (resourceId: string, value: string) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return;
        setEdits((prev) => new Map(prev).set(resourceId, num));
        setDirty(true);
    };

    const handleSave = async () => {
        if (edits.size === 0) return;
        const updates = Array.from(edits.entries()).map(([resourceId, manualQty]) => ({
            resourceId,
            manualQty,
        }));
        await save(updates);
        toast.success("Resources saved");
        setDirty(false);
    };

    const handleRecalculate = async () => {
        await recalculate();
        toast.success("Resources recalculated");
    };

    const getDisplayQty = (r: BookingResource): number => {
        if (edits.has(r.resourceId)) return edits.get(r.resourceId)!;
        return r.effectiveQty;
    };

    const isEdited = (r: BookingResource): boolean => {
        return edits.has(r.resourceId) || r.isManuallyEdited;
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-slate-900 border-l border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Resource Planner</h2>
                                {bookingLabel && (
                                    <p className="text-xs text-muted mt-0.5">{bookingLabel}</p>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                            {loading && (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
                                    <span className="ml-2 text-sm text-muted">Calculating resources…</span>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {!loading && !error && resources.length === 0 && (
                                <div className="text-center py-16 text-muted text-sm">
                                    No resources calculated yet.
                                </div>
                            )}

                            {!loading &&
                                CATEGORY_ORDER.map((cat) => {
                                    const items = grouped[cat];
                                    if (items.length === 0) return null;
                                    const meta = CATEGORY_META[cat];
                                    const Icon = meta.icon;

                                    return (
                                        <div key={cat}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon className={cn("h-4 w-4", meta.color)} />
                                                <h3 className={cn("text-sm font-semibold", meta.color)}>
                                                    {meta.label}
                                                </h3>
                                                <span className="text-xs text-muted">({items.length})</span>
                                            </div>

                                            <div className="space-y-2">
                                                {items.map((r) => (
                                                    <div
                                                        key={r.id}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                                            isEdited(r)
                                                                ? "bg-gold-500/5 border-gold-500/20"
                                                                : "bg-white/[0.02] border-white/5"
                                                        )}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm text-white truncate">
                                                                    {r.resourceName}
                                                                </span>
                                                                {r.isManuallyEdited && !edits.has(r.resourceId) && (
                                                                    <Pencil className="h-3 w-3 text-gold-400 shrink-0" />
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted">{r.unit}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {r.isManuallyEdited && r.manualQty !== null && (
                                                                <span className="text-[10px] text-muted line-through">
                                                                    {r.calculatedQty}
                                                                </span>
                                                            )}
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step="any"
                                                                value={getDisplayQty(r)}
                                                                onChange={(e) => handleQtyChange(r.resourceId, e.target.value)}
                                                                className={cn(
                                                                    "w-20 text-right text-sm font-medium rounded-md px-2 py-1 border bg-transparent focus:outline-none focus:ring-1 focus:ring-gold-500/50",
                                                                    isEdited(r)
                                                                        ? "border-gold-500/30 text-gold-300"
                                                                        : "border-white/10 text-white"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-white/10 flex items-center gap-3">
                            <button
                                onClick={handleRecalculate}
                                disabled={loading || saving}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white border border-white/10 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                                Recalculate
                            </button>

                            <div className="flex-1" />

                            <button
                                onClick={onClose}
                                className="px-3 py-2 text-xs font-medium rounded-lg text-muted hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!dirty || saving}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gold-500 hover:bg-gold-400 text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Save className="h-3.5 w-3.5" />
                                )}
                                Save
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
