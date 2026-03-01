import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { Branch } from "@/types";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<string>("OWNER");
    const [branchId, setBranchId] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const navigate = useNavigate();
    const { signUp } = useAuthStore();

    // Fetch branches for branch manager selection
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/branches", { timeout: 5000 });
                const data = res.data?.data;
                if (Array.isArray(data)) setBranches(data);
            } catch {
                // No branches yet — that's fine for first OWNER signup
            }
        })();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (role === "BRANCH_MANAGER" && !branchId) {
            toast.error("Please select a branch");
            return;
        }
        setLoading(true);
        try {
            await signUp({
                name,
                email,
                password,
                phone: phone || undefined,
                role,
                branchId: role !== "OWNER" ? branchId : undefined,
            });
            toast.success("Account created! Welcome to EVENTORA.");
            navigate("/");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; error?: string } } };
            toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient shadow-glow mb-4">
                        <Sparkles className="h-8 w-8 text-black" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white tracking-tight">
                        EVENTORA
                    </h1>
                    <p className="text-muted text-sm mt-1">Create your account</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="input-dark"
                                required
                                minLength={2}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="input-dark"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">
                                Phone <span className="text-muted/50">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                                className="input-dark"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    className="input-dark pr-10"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="input-dark"
                            >
                                <option value="OWNER">Owner</option>
                                <option value="BRANCH_MANAGER">Branch Manager</option>
                                <option value="SALES">Sales</option>
                                <option value="OPERATIONS">Operations</option>
                            </select>
                        </div>

                        {/* Branch selector — only for non-owner roles */}
                        {role !== "OWNER" && (
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1.5">
                                    Branch
                                </label>
                                {branches.length === 0 ? (
                                    <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg">
                                        No branches exist yet. An Owner must sign up first and create branches.
                                    </p>
                                ) : (
                                    <select
                                        value={branchId}
                                        onChange={(e) => setBranchId(e.target.value)}
                                        className="input-dark"
                                        required
                                    >
                                        <option value="">Select branch...</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.city})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full py-3 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                        Sign In
                    </Link>
                </p>

                <p className="text-center text-xs text-muted/50 mt-4">
                    &copy; 2026 EVENTORA. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
