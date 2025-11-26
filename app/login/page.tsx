"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Erro ao fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            DentalCare
                        </h1>
                        <p className="text-gray-600">Sistema de Gestão Odontológica</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center mb-3">
                            Credenciais de teste:
                        </p>
                        <div className="space-y-2 text-xs text-gray-500">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="font-semibold text-gray-700">Admin:</p>
                                <p>admin@clinica.com / admin123</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="font-semibold text-gray-700">Dentista:</p>
                                <p>dentista@clinica.com / dentist123</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="font-semibold text-gray-700">Recepcionista:</p>
                                <p>recepcao@clinica.com / recep123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
