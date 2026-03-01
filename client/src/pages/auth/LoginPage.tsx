import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            toast.success("Welcome back!");
            navigate("/");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; error?: string } } };
            toast.error(error.response?.data?.message || error.response?.data?.error || "Invalid credentials");
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
                <div className="flex flex-col items-center mb-10">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient shadow-glow mb-4">
                        <Sparkles className="h-8 w-8 text-black" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white tracking-tight">
                        EVENTORA
                    </h1>
                    <p className="text-muted text-sm mt-1">Premium Banquet Management</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
                        <p className="text-sm text-muted mt-1">
                            Sign in to your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
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

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="input-dark pr-10"
                                    required
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full py-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-muted mt-6">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                        Sign Up
                    </Link>
                </p>

                <p className="text-center text-xs text-muted/50 mt-4">
                    &copy; 2026 EVENTORA. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
