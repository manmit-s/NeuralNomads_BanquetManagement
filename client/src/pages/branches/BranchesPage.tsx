import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Branch } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { Plus, MapPin } from "lucide-react";

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data } = await api.get("/branches");
                setBranches(data.data);
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
                title="Branches"
                subtitle="Manage your banquet locations"
                action={<button className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Branch</button>}
            />

            {loading ? (
                <LoadingSpinner />
            ) : branches.length === 0 ? (
                <EmptyState title="No branches" description="Add your first branch to get started" />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {branches.map((branch) => (
                        <div key={branch.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                                <span className={`badge ${branch.isActive ? "badge-success" : "badge-danger"}`}>
                                    {branch.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="mt-3 space-y-1 text-sm text-gray-500">
                                <p className="flex items-center gap-1"><MapPin size={14} /> {branch.address}, {branch.city}</p>
                                <p>{branch.phone}</p>
                                <p>{branch.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
