import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2, User, Mail, Lock, Phone, Briefcase } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: "",
        role: "OWNER" as const,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn, signUp } = useAuthStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(formData);
                toast.success("Account created! You can now sign in.");
                setIsSignUp(false);
            } else {
                await signIn(formData.email, formData.password);
                toast.success("Welcome back!");
                navigate("/");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Authentication failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-gradient shadow-glow mb-4"
                    >
                        <Sparkles className="h-8 w-8 text-black" />
                    </motion.div>
                    <h1 className="font-display text-3xl font-bold text-white tracking-tight">
                        EVENTORA
                    </h1>
                    <p className="text-muted text-sm mt-1">Premium Banquet Management</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 border border-white/5 shadow-2xl overflow-hidden">
                    <div className="text-center mb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isSignUp ? "signup-title" : "signin-title"}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-semibold text-white">
                                    {isSignUp ? "Create an account" : "Welcome back"}
                                </h2>
                                <p className="text-sm text-muted mt-1">
                                    {isSignUp ? "Join the industry standard in banquet management" : "Sign in to your dashboard"}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {isSignUp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1.5 ml-1">
                                            Full Name
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                                            <input
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your name"
                                                className="input-dark pl-10"
                                                required={isSignUp}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1.5 ml-1">
                                            Phone Number
                                        </label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91-0000000000"
                                                className="input-dark pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted mb-1.5 ml-1">
                                            Your Role
                                        </label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="input-dark pl-10 appearance-none bg-background cursor-pointer"
                                                required={isSignUp}
                                            >
                                                <option value="OWNER">Owner</option>
                                                <option value="BRANCH_MANAGER">Branch Manager</option>
                                                <option value="SALES">Sales Associate</option>
                                                <option value="OPERATIONS">Operations</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    className="input-dark pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-sm font-medium text-muted">
                                    Password
                                </label>
                                {!isSignUp && (
                                    <button type="button" className="text-xs text-gold-400 hover:text-gold-300 transition-colors underline-offset-4 hover:underline">
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-gold-400 transition-colors" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input-dark px-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
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
                            className="btn-gold w-full py-3 mt-6 font-semibold tracking-wide relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                                    <span>{isSignUp ? "Creating Account..." : "Signing in..."}</span>
                                </div>
                            ) : (
                                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-muted">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-gold-400 font-semibold hover:text-gold-300 transition-colors hover:bg-gold-500/10 px-2 py-1 rounded-lg"
                            >
                                {isSignUp ? "Sign In" : "Register Now"}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-muted/30 mt-8">
                    By continuing, you agree to EVENTORA's Terms of Service and Privacy Policy.
                    <br />
                    &copy; 2026 EVENTORA. All rights reserved.
                </p>
            </motion.div>
        </div >
    );
}
