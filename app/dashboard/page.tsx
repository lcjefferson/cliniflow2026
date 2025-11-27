'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Calendar, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Stat {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
    color: string;
}

interface Appointment {
    id: string;
    patient: string;
    time: string;
    service: string;
    professional: string;
    status: string;
}

interface Activity {
    action: string;
    user: string;
    time: string;
    type: string;
}

interface DashboardData {
    stats: Stat[];
    quickStats: {
        conversionRate: number;
        occupancyRate: number;
        satisfactionRate: number;
        followUpRate: number;
    };
    recentAppointments: Appointment[];
    activities: Activity[];
}

const iconMap = {
    Users,
    UserPlus,
    Calendar,
    DollarSign,
};

const statusConfig = {
    confirmed: { label: 'Confirmado', variant: 'success' as const },
    in_progress: { label: 'Em Andamento', variant: 'info' as const },
    scheduled: { label: 'Agendado', variant: 'default' as const },
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                const response = await fetch('/api/dashboard/stats');
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Erro ao carregar dados do dashboard');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-gray-700">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Erro ao carregar dados'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-700">Visão geral da sua clínica odontológica</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {data.stats.map((stat, index) => {
                    const Icon = iconMap[stat.icon as keyof typeof iconMap] || Users;
                    const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

                    return (
                        <Card key={index} className="overflow-hidden hover:scale-105 transition-transform duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        <TrendIcon className="h-4 w-4" />
                                        {stat.change}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-700 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary-400" />
                            Agendamentos de Hoje
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.recentAppointments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Nenhum agendamento para hoje</p>
                        ) : (
                            <div className="space-y-4">
                                {data.recentAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center justify-between p-4 rounded-xl glass-hover"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20">
                                                <Clock className="h-5 w-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{appointment.patient}</p>
                                                <p className="text-sm text-gray-700">
                                                    {appointment.time} • {appointment.service}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={statusConfig[appointment.status as keyof typeof statusConfig]?.variant || 'default'}>
                                                {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                                            </Badge>
                                            <p className="text-xs text-gray-700 mt-1">{appointment.professional}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats removed as requested */}
            </div>

            {/* Activity Feed */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary-400" />
                        Atividades Recentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.activities.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
                    ) : (
                        <div className="space-y-4">
                            {data.activities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4 p-3 rounded-xl glass-hover">
                                    <div className="flex h-2 w-2 mt-2 rounded-full bg-primary-500 ring-4 ring-primary-500/20"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-sm text-gray-700">{activity.user}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
