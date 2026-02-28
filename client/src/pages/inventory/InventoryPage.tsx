import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { InventoryItem } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { Plus, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/inventory");
                setItems(data.data);
            } catch {
                //
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div>
            <PageHeader
                title="Inventory"
                subtitle="Track raw materials and stock levels"
                action={<button className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Item</button>}
            />

            {loading ? (
                <LoadingSpinner />
            ) : items.length === 0 ? (
                <EmptyState title="No inventory items" description="Add raw materials to track stock" />
            ) : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="table-header">Name</th>
                                <th className="table-header">Category</th>
                                <th className="table-header">Current Stock</th>
                                <th className="table-header">Min Level</th>
                                <th className="table-header">Unit</th>
                                <th className="table-header">Cost/Unit</th>
                                <th className="table-header">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => {
                                const isLow = item.currentStock <= item.minStockLevel;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="table-cell font-medium">{item.name}</td>
                                        <td className="table-cell">{item.category}</td>
                                        <td className={`table-cell font-mono ${isLow ? "text-red-600 font-bold" : ""}`}>
                                            {item.currentStock}
                                        </td>
                                        <td className="table-cell font-mono text-gray-500">{item.minStockLevel}</td>
                                        <td className="table-cell">{item.unit}</td>
                                        <td className="table-cell">₹{item.costPerUnit}</td>
                                        <td className="table-cell">
                                            {isLow ? (
                                                <span className="badge-danger flex items-center gap-1 w-fit">
                                                    <AlertTriangle size={12} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="badge-success">In Stock</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
