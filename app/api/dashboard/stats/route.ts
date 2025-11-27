import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from 'date-fns';

export async function GET() {
    try {
        const now = new Date();
        const today = startOfDay(now);
        const todayEnd = endOfDay(now);
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // Get clinic ID (assuming first clinic for now)
        const clinic = await prisma.clinic.findFirst();
        if (!clinic) {
            return NextResponse.json({ error: 'No clinic found' }, { status: 404 });
        }

        // Total Patients
        const totalPatients = await prisma.patient.count({
            where: { clinicId: clinic.id, active: true },
        });

        const lastMonthPatients = await prisma.patient.count({
            where: {
                clinicId: clinic.id,
                active: true,
                createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
        });

        const thisMonthPatients = await prisma.patient.count({
            where: {
                clinicId: clinic.id,
                active: true,
                createdAt: { gte: monthStart, lte: monthEnd },
            },
        });

        const patientsChange = lastMonthPatients > 0
            ? ((thisMonthPatients - lastMonthPatients) / lastMonthPatients) * 100
            : thisMonthPatients > 0 ? 100 : 0;

        // Active Leads
        const activeLeads = await prisma.lead.count({
            where: {
                clinicId: clinic.id,
                status: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] },
            },
        });

        const lastMonthLeads = await prisma.lead.count({
            where: {
                clinicId: clinic.id,
                status: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] },
                createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
        });

        const thisMonthLeads = await prisma.lead.count({
            where: {
                clinicId: clinic.id,
                status: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] },
                createdAt: { gte: monthStart, lte: monthEnd },
            },
        });

        const leadsChange = lastMonthLeads > 0
            ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100
            : thisMonthLeads > 0 ? 100 : 0;

        // Today's Appointments
        const todayAppointments = await prisma.appointment.count({
            where: {
                clinicId: clinic.id,
                startTime: { gte: today, lte: todayEnd },
            },
        });

        // Average daily appointments this month
        const monthAppointments = await prisma.appointment.count({
            where: {
                clinicId: clinic.id,
                startTime: { gte: monthStart, lte: monthEnd },
            },
        });

        const daysInMonth = now.getDate();
        const avgDailyAppointments = daysInMonth > 0 ? monthAppointments / daysInMonth : 0;
        const appointmentsChange = avgDailyAppointments > 0
            ? ((todayAppointments - avgDailyAppointments) / avgDailyAppointments) * 100
            : todayAppointments > 0 ? 100 : 0;

        // Monthly Revenue
        const monthlyRevenue = await prisma.payment.aggregate({
            where: {
                status: 'PAID',
                paidDate: { gte: monthStart, lte: monthEnd },
            },
            _sum: { amount: true },
        });

        const lastMonthRevenue = await prisma.payment.aggregate({
            where: {
                status: 'PAID',
                paidDate: { gte: lastMonthStart, lte: lastMonthEnd },
            },
            _sum: { amount: true },
        });

        const revenue = monthlyRevenue._sum?.amount || 0;
        const lastRevenue = lastMonthRevenue._sum?.amount || 0;
        const revenueChange = lastRevenue > 0
            ? ((revenue - lastRevenue) / lastRevenue) * 100
            : revenue > 0 ? 100 : 0;

        // Conversion Rate (leads converted to patients this month)
        const convertedLeads = await prisma.lead.count({
            where: {
                clinicId: clinic.id,
                status: 'CONVERTED',
                updatedAt: { gte: monthStart, lte: monthEnd },
            },
        });

        const totalLeadsThisMonth = await prisma.lead.count({
            where: {
                clinicId: clinic.id,
                createdAt: { lte: monthEnd },
            },
        });

        const conversionRate = totalLeadsThisMonth > 0
            ? (convertedLeads / totalLeadsThisMonth) * 100
            : 0;

        // Calendar Occupancy
        const totalAppointmentsThisMonth = await prisma.appointment.count({
            where: {
                clinicId: clinic.id,
                startTime: { gte: monthStart, lte: monthEnd },
            },
        });

        const activeProfessionals = await prisma.professional.count({
            where: { clinicId: clinic.id, active: true },
        });

        // Assuming 8 hours/day, 22 working days/month, 1 hour per appointment
        const availableSlots = activeProfessionals * 8 * 22;
        const occupancyRate = availableSlots > 0
            ? (totalAppointmentsThisMonth / availableSlots) * 100
            : 0;

        // Follow-ups (executions sent this month)
        const followUpsSent = await prisma.followUpExecution.count({
            where: {
                clinicId: clinic.id,
                status: 'SENT',
                executedAt: { gte: monthStart, lte: monthEnd },
            },
        });

        const totalFollowUps = await prisma.followUpExecution.count({
            where: {
                clinicId: clinic.id,
                scheduledFor: { gte: monthStart, lte: monthEnd },
            },
        });

        const followUpRate = totalFollowUps > 0
            ? (followUpsSent / totalFollowUps) * 100
            : 0;

        // Recent Appointments (today)
        const recentAppointments = await prisma.appointment.findMany({
            where: {
                clinicId: clinic.id,
                startTime: { gte: today, lte: todayEnd },
            },
            include: {
                patient: { select: { name: true } },
                professional: { select: { name: true } },
                service: { select: { name: true } },
            },
            orderBy: { startTime: 'asc' },
            take: 5,
        });

        const formattedAppointments = recentAppointments.map((apt) => ({
            id: apt.id,
            patient: apt.patient.name,
            time: apt.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            service: apt.service?.name || 'Consulta',
            professional: apt.professional.name,
            status: apt.status.toLowerCase(),
        }));

        // Recent Activities
        const recentPatients = await prisma.patient.findMany({
            where: { clinicId: clinic.id },
            orderBy: { createdAt: 'desc' },
            take: 2,
            select: { name: true, createdAt: true },
        });

        const recentPayments = await prisma.payment.findMany({
            where: { status: 'PAID' },
            orderBy: { paidDate: 'desc' },
            take: 2,
            include: { patient: true },
        });

        const recentLeadConversions = await prisma.lead.findMany({
            where: { clinicId: clinic.id, status: 'CONVERTED' },
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: { name: true, updatedAt: true },
        });

        const recentFollowUps = await prisma.followUpExecution.findMany({
            where: { clinicId: clinic.id, status: 'SENT' },
            orderBy: { executedAt: 'desc' },
            take: 1,
            include: { followUp: { select: { name: true } } },
        });

        const activities = [
            ...recentPatients.map((p) => ({
                action: 'Novo paciente cadastrado',
                user: p.name,
                time: getRelativeTime(p.createdAt),
                type: 'patient',
                timestamp: p.createdAt,
            })),
            ...recentPayments.map((p) => ({
                action: 'Pagamento recebido',
                user: `R$ ${p.amount.toFixed(2)} - ${p.patient?.name || 'N/A'}`,
                time: getRelativeTime(p.paidDate || p.createdAt),
                type: 'payment',
                timestamp: p.paidDate || p.createdAt,
            })),
            ...recentLeadConversions.map((l) => ({
                action: 'Lead convertido',
                user: l.name,
                time: getRelativeTime(l.updatedAt),
                type: 'lead',
                timestamp: l.updatedAt,
            })),
            ...recentFollowUps.map((f) => ({
                action: 'Follow-up enviado',
                user: f.followUp.name,
                time: getRelativeTime(f.executedAt || f.createdAt),
                type: 'followup',
                timestamp: f.executedAt || f.createdAt,
            })),
        ]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5)
            .map((a) => ({ action: a.action, user: a.user, time: a.time, type: a.type }));

        return NextResponse.json({
            stats: [
                {
                    title: 'Total de Pacientes',
                    value: totalPatients.toString(),
                    change: `${patientsChange >= 0 ? '+' : ''}${patientsChange.toFixed(0)}%`,
                    trend: patientsChange >= 0 ? 'up' : 'down',
                    icon: 'Users',
                    color: 'from-primary-500 to-primary-600',
                },
                {
                    title: 'Leads Ativos',
                    value: activeLeads.toString(),
                    change: `${leadsChange >= 0 ? '+' : ''}${leadsChange.toFixed(0)}%`,
                    trend: leadsChange >= 0 ? 'up' : 'down',
                    icon: 'UserPlus',
                    color: 'from-blue-500 to-blue-600',
                },
                {
                    title: 'Agendamentos Hoje',
                    value: todayAppointments.toString(),
                    change: `${appointmentsChange >= 0 ? '+' : ''}${appointmentsChange.toFixed(0)}%`,
                    trend: appointmentsChange >= 0 ? 'up' : 'down',
                    icon: 'Calendar',
                    color: 'from-purple-500 to-purple-600',
                },
                {
                    title: 'Receita Mensal',
                    value: `R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(0)}%`,
                    trend: revenueChange >= 0 ? 'up' : 'down',
                    icon: 'DollarSign',
                    color: 'from-green-500 to-green-600',
                },
            ],
            quickStats: {
                conversionRate: Math.round(conversionRate),
                occupancyRate: Math.round(occupancyRate),
                satisfactionRate: 92, // This would need a separate survey/rating system
                followUpRate: Math.round(followUpRate),
            },
            recentAppointments: formattedAppointments,
            activities,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard statistics' },
            { status: 500 }
        );
    }
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}
