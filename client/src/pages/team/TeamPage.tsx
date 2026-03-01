import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus,
    Eye,
    EyeOff,
    Loader2,
    Shield,
    Users,
    Mail,
    Phone,
    Building2,
    ChevronDown,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

/* ─── types ─── */

interface Branch {
    id: string;
    name: string;
}

interface Member {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    branch: { id: string; name: string } | null;
    createdAt: string;
}

interface MemberForm {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    branchId: string;
}

const emptyForm: MemberForm = { name: "", email: "", phone: "", password: "", role: "BRANCH_MANAGER", branchId: "" };

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    BRANCH_MANAGER: { label: "Branch Manager", color: "bg-blue-500/20 text-blue-400" },
    SALES: { label: "Sales", color: "bg-green-500/20 text-green-400" },
    OPERATIONS: { label: "Operations", color: "bg-purple-500/20 text-purple-400" },
};

/* ─── component ─── */

export default function TeamPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<MemberForm>({ ...emptyForm });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    /* fetch data */
    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [usersRes, branchesRes] = await Promise.all([
                api.get("/users"),
                api.get("/branches"),
            ]);
            setMembers(usersRes.data.data);
            setBranches(branchesRes.data.data);
        } catch {
            toast.error("Failed to load team data");
        } finally {
            setLoading(false);
        }
    };

    /* create member */
    const handleCreate = async () => {
        setSubmitting(true);
        try {
            await api.post("/users", {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone || undefined,
                role: form.role,
                branchId: form.branchId,
            });
            toast.success(`${form.name} added to the team!`);
            setShowModal(false);
            setForm({ ...emptyForm });
            fetchAll();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to add member");
        } finally {
            setSubmitting(false);
        }
    };

    /* toggle active */
    const toggleActive = async (member: Member) => {
        try {
            await api.patch(`/users/${member.id}`, { isActive: !member.isActive });
            toast.success(`${member.name} ${member.isActive ? "deactivated" : "activated"}`);
            fetchAll();
        } catch {
            toast.error("Failed to update member");
        }
    };

    const formValid =
        form.name.length >= 2 &&
        form.email.includes("@") &&
        form.password.length >= 6 &&
        form.role &&
        form.branchId;

    /* ─── input helper ─── */
    const inputCls =
        "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition text-sm";
    const labelCls = "mb-1.5 block text-xs font-medium text-white/60 uppercase tracking-wider";

    /* ─── render ─── */
    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Team</h1>
                    <p className="text-sm text-white/50">Manage staff accounts & permissions</p>
                </div>
                <button
                    onClick={() => {
                        setForm({ ...emptyForm, branchId: branches[0]?.id || "" });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:shadow-lg hover:shadow-amber-400/20"
                >
                    <UserPlus size={16} /> Add Member
                </button>
            </div>

            {/* table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-amber-400" size={32} />
                </div>
            ) : members.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                    <Users className="mx-auto mb-3 text-white/20" size={48} />
                    <h3 className="text-lg font-semibold text-white/80">No team members yet</h3>
                    <p className="mb-4 text-sm text-white/40">
                        Add branch managers and staff to give them login access scoped to their branch.
                    </p>
                    <button
                        onClick={() => {
                            setForm({ ...emptyForm, branchId: branches[0]?.id || "" });
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-400/20"
                    >
                        <UserPlus size={14} /> Add your first member
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Branch</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((m) => (
                                <tr key={m.id} className="transition hover:bg-white/5">
                                    <td className="px-5 py-3 font-medium text-white">{m.name}</td>
                                    <td className="px-5 py-3 text-white/60">{m.email}</td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_LABELS[m.role]?.color || "bg-white/10 text-white/60"}`}
                                        >
                                            {ROLE_LABELS[m.role]?.label || m.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-white/60">{m.branch?.name || "—"}</td>
                                    <td className="px-5 py-3">
                                        {m.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                                <CheckCircle2 size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-400">
                                                <XCircle size={12} /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => toggleActive(m)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${m.isActive
                                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                }`}
                                        >
                                            {m.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ─── Add Member Modal ─── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* close */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-4 top-4 rounded-lg p-1 text-white/30 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>

                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                                    <UserPlus className="text-amber-400" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Add Team Member</h2>
                                    <p className="text-xs text-white/50">
                                        They'll use these credentials to log in
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* name */}
                                <div>
                                    <label className={labelCls}>Full Name</label>
                                    <div className="relative">
                                        <Users
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            className={`${inputCls} pl-9`}
                                            placeholder="Rajesh Kumar"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* email */}
                                <div>
                                    <label className={labelCls}>Email</label>
                                    <div className="relative">
                                        <Mail
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            className={`${inputCls} pl-9`}
                                            type="email"
                                            placeholder="rajesh@eventora.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* phone */}
                                <div>
                                    <label className={labelCls}>
                                        Phone <span className="text-white/30">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            className={`${inputCls} pl-9`}
                                            placeholder="+91 98765 43210"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* password */}
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <div className="relative">
                                        <Shield
                                            size={14}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                        />
                                        <input
                                            className={`${inputCls} pl-9 pr-10`}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 6 characters"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* role + branch row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelCls}>Role</label>
                                        <div className="relative">
                                            <select
                                                className={`${inputCls} appearance-none pr-8`}
                                                value={form.role}
                                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            >
                                                <option value="BRANCH_MANAGER" className="bg-slate-900 text-white">Branch Manager</option>
                                                <option value="SALES" className="bg-slate-900 text-white">Sales</option>
                                                <option value="OPERATIONS" className="bg-slate-900 text-white">Operations</option>
                                            </select>
                                            <ChevronDown
                                                size={14}
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Branch</label>
                                        <div className="relative">
                                            <Building2
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                                            />
                                            <select
                                                className={`${inputCls} appearance-none pl-9 pr-8`}
                                                value={form.branchId}
                                                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                                            >
                                                {branches.length === 0 && (
                                                    <option value="" className="bg-slate-900 text-white">No branches yet</option>
                                                )}
                                                {branches.map((b) => (
                                                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={14}
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* submit */}
                            <button
                                onClick={handleCreate}
                                disabled={!formValid || submitting}
                                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-semibold text-black transition hover:shadow-lg hover:shadow-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        <UserPlus size={16} /> Create Account
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
