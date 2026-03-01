import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signUp } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signUp({ name, email, password, phone: phone || undefined });
            toast.success("Welcome to EVENTORA! Let's set up your first branch.");
            navigate("/onboarding");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; error?: string } } };
            toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
                    <p className="text-muted text-sm mt-1">Register as Owner</p>
                </div>

                <div className="glass-card p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-semibold text-white">Create your Owner account</h2>
                        <p className="text-xs text-muted mt-1">
                            You'll set up branches & invite your team after this
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Raj Patel"
                                className="input-dark"
                                required
                                minLength={2}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="owner@yourbanquet.com"
                                className="input-dark"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">
                                Phone <span className="text-muted/50">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="9876543210"
                                className="input-dark"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
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
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-gold w-full py-3 mt-2">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <span>Get Started</span>
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

                <p className="text-center text-xs text-muted/50 mt-3">
                    Staff members? Ask your owner to create your account.
                </p>
            </motion.div>
        </div>
    );
}
