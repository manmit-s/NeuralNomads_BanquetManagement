import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    TrendingDown,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import Modal from "@/components/ui/Modal";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    unit: string;
    costPerUnit: number;
    lastRestocked?: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<"all" | "low">("all");

    const [form, setForm] = useState({
        name: "",
        category: "Crockery",
        currentStock: "",
        minimumStock: "",
        unit: "pcs",
        costPerUnit: "",
    });

    const loadItems = useCallback(async () => {
        try {
            const { data } = await api.get("/inventory");
            setItems(data.data || []);
        } catch {
            // Fallback demo data for presentation
            setItems([
                { id: "1", name: "Dinner Plates", category: "Crockery", currentStock: 450, minimumStock: 200, unit: "pcs", costPerUnit: 120 },
                { id: "2", name: "Wine Glasses", category: "Glassware", currentStock: 80, minimumStock: 100, unit: "pcs", costPerUnit: 250 },
                { id: "3", name: "Table Cloths (White)", category: "Linen", currentStock: 35, minimumStock: 50, unit: "pcs", costPerUnit: 800 },
                { id: "4", name: "Serving Spoons", category: "Cutlery", currentStock: 200, minimumStock: 100, unit: "pcs", costPerUnit: 150 },
                { id: "5", name: "Round Tables (6ft)", category: "Furniture", currentStock: 25, minimumStock: 20, unit: "pcs", costPerUnit: 5000 },
                { id: "6", name: "Chafing Dishes", category: "Equipment", currentStock: 12, minimumStock: 15, unit: "pcs", costPerUnit: 3500 },
                { id: "7", name: "Fairy Lights (100m)", category: "Decoration", currentStock: 8, minimumStock: 10, unit: "rolls", costPerUnit: 1200 },
                { id: "8", name: "Napkins (Cloth)", category: "Linen", currentStock: 500, minimumStock: 300, unit: "pcs", costPerUnit: 80 },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const filtered = items
        .filter((i) => (filter === "low" ? i.currentStock < i.minimumStock : true))
        .filter((i) =>
            search
                ? i.name.toLowerCase().includes(search.toLowerCase()) ||
                i.category.toLowerCase().includes(search.toLowerCase())
                : true
        );

    const lowStockCount = items.filter((i) => i.currentStock < i.minimumStock).length;
    const totalValue = items.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/inventory", {
                ...form,
                currentStock: parseInt(form.currentStock),
                minimumStock: parseInt(form.minimumStock),
                costPerUnit: parseFloat(form.costPerUnit),
            });
            toast.success("Item added!");
            setShowModal(false);
            loadItems();
        } catch {
            toast.error("Failed to add item");
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
                title="Inventory"
                subtitle="Track your stock and supplies"
                icon={Package}
                action={
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-dark pl-9 w-60"
                            />
                        </div>
                        <button onClick={() => setShowModal(true)} className="btn-gold">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </button>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <GlassCard>
                    <div className="flex items-center gap-3 p-4">
                        <div className="h-10 w-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gold-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted">Total Items</p>
                            <p className="text-lg font-bold text-white">{items.length}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3 p-4">
                        <div className="h-10 w-10 rounded-xl bg-danger/10 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-danger" />
                        </div>
                        <div>
                            <p className="text-xs text-muted">Low Stock</p>
                            <p className="text-lg font-bold text-danger">{lowStockCount}</p>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard>
                    <div className="flex items-center gap-3 p-4">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <TrendingDown className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted">Total Value</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(totalValue)}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Filter */}
            <div className="flex gap-1 mb-5 bg-surface/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setFilter("all")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                        filter === "all"
                            ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                            : "text-muted hover:text-white"
                    )}
                >
                    All Items
                </button>
                <button
                    onClick={() => setFilter("low")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                        filter === "low"
                            ? "bg-danger/10 text-danger border border-danger/20"
                            : "text-muted hover:text-white"
                    )}
                >
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock ({lowStockCount})
                </button>
            </div>

            {/* Table */}
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs font-medium text-muted px-5 py-3">Item</th>
                                <th className="text-left text-xs font-medium text-muted px-5 py-3">Category</th>
                                <th className="text-center text-xs font-medium text-muted px-5 py-3">Stock</th>
                                <th className="text-center text-xs font-medium text-muted px-5 py-3">Min</th>
                                <th className="text-right text-xs font-medium text-muted px-5 py-3">Unit Cost</th>
                                <th className="text-right text-xs font-medium text-muted px-5 py-3">Value</th>
                                <th className="text-center text-xs font-medium text-muted px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, i) => {
                                const isLow = item.currentStock < item.minimumStock;
                                const stockPercent = Math.min(
                                    100,
                                    Math.round((item.currentStock / item.minimumStock) * 100)
                                );

                                return (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-medium text-white">{item.name}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={cn("text-sm font-medium", isLow ? "text-danger" : "text-white")}>
                                                {item.currentStock}
                                            </span>
                                            <span className="text-xs text-muted ml-1">{item.unit}</span>
                                        </td>
                                        <td className="px-5 py-4 text-center text-sm text-muted">
                                            {item.minimumStock}
                                        </td>
                                        <td className="px-5 py-4 text-right text-sm text-muted">
                                            {formatCurrency(item.costPerUnit)}
                                        </td>
                                        <td className="px-5 py-4 text-right text-sm text-white font-medium">
                                            {formatCurrency(item.currentStock * item.costPerUnit)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            isLow ? "bg-danger" : "bg-green-500"
                                                        )}
                                                        style={{ width: `${stockPercent}%` }}
                                                    />
                                                </div>
                                                {isLow && (
                                                    <span className="text-[10px] text-danger font-medium">LOW</span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Create Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Inventory Item" size="md">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Item Name</label>
                            <input
                                className="input-dark"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Category</label>
                            <select
                                className="input-dark"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option>Crockery</option>
                                <option>Glassware</option>
                                <option>Cutlery</option>
                                <option>Linen</option>
                                <option>Furniture</option>
                                <option>Equipment</option>
                                <option>Decoration</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Current Stock</label>
                            <input
                                className="input-dark"
                                type="number"
                                value={form.currentStock}
                                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Min Stock</label>
                            <input
                                className="input-dark"
                                type="number"
                                value={form.minimumStock}
                                onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Unit</label>
                            <select
                                className="input-dark"
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                            >
                                <option value="pcs">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="litre">Litres</option>
                                <option value="rolls">Rolls</option>
                                <option value="sets">Sets</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Cost per Unit (₹)</label>
                        <input
                            className="input-dark"
                            type="number"
                            value={form.costPerUnit}
                            onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-gold">
                            Add Item
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
