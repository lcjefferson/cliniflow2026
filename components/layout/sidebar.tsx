'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    Users,
    UserPlus,
    MessageSquare,
    Bell,
    Stethoscope,
    Briefcase,
    FileText,
    DollarSign,
    Settings,
    UserCog,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendário', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Pacientes', href: '/dashboard/patients', icon: Users },
    { name: 'Leads', href: '/dashboard/leads', icon: UserPlus },
    { name: 'Omnichannel', href: '/dashboard/omnichannel', icon: MessageSquare },
    { name: 'Follow-Up', href: '/dashboard/follow-up', icon: Bell },
    { name: 'Profissionais', href: '/dashboard/professionals', icon: Stethoscope },
    { name: 'Serviços', href: '/dashboard/services', icon: Briefcase },
    { name: 'Relatórios', href: '/dashboard/reports', icon: FileText },
    { name: 'Faturamento', href: '/dashboard/financial', icon: DollarSign },
    { name: 'Usuários', href: '/dashboard/users', icon: UserCog },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-lg">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                        <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">CliniFlow</h1>
                        <p className="text-xs text-gray-700">Gestão Odontológica</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                            <span className="text-sm font-semibold text-white">AD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                            <p className="text-xs text-gray-700 truncate">admin@dentalcare.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
