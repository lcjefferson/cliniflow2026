'use client';

import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function Header() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-8">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar pacientes, agendamentos..."
                            className="input-premium w-full pl-12 py-2"
                            suppressHydrationWarning
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative rounded-xl p-2 hover:bg-gray-100 transition-colors">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
                    </button>

                    {/* Settings */}
                    <button className="rounded-xl p-2 hover:bg-gray-100 transition-colors">
                        <Settings className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* User Info */}
                    {session?.user && (
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {session.user.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-xl p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Sair"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
