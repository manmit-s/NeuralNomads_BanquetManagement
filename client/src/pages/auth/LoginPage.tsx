import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";

export default function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            toast.success("Welcome back!");
            navigate("/");
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="w-full max-w-md">
                <div className="card">
                    {/* Logo */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600">
                            <ClipboardList className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">BanquetPro</h1>
                        <p className="mt-1 text-sm text-gray-500">Multi-Branch Banquet Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
