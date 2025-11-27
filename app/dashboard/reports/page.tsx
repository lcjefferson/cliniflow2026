'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, Loader2, Printer } from 'lucide-react';
import { openReportPrintWindow } from '@/lib/reports/report-print-utils';
import { toast } from 'sonner';
import { subMonths, format } from 'date-fns';

type ReportType = 'financial' | 'appointments' | 'patients';

export default function ReportsPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [reportType, setReportType] = useState<ReportType>('financial');
    const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const generateReport = async (type: ReportType, quickReport = false) => {
        try {
            const loadingKey = quickReport ? `${type}-quick` : 'custom';
            setLoading(loadingKey);

            // Use last month for quick reports
            const params = new URLSearchParams({
                startDate: quickReport ? format(subMonths(new Date(), 1), 'yyyy-MM-dd') : startDate,
                endDate: quickReport ? format(new Date(), 'yyyy-MM-dd') : endDate,
            });

            const response = await fetch(`/api/reports/${type}?${params}`);

            if (!response.ok) {
                throw new Error('Erro ao gerar relatório');
            }

            const data = await response.json();

            // Open print window with report HTML
            openReportPrintWindow(data);

            toast.success('Relatório gerado! Use Ctrl+P ou Cmd+P para salvar como PDF.');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Erro ao gerar relatório');
        } finally {
            setLoading(null);
        }
    };

    const reportTypes = [
        {
            id: 'financial' as ReportType,
            name: 'Relatório Financeiro',
            description: 'Receitas, despesas e lucro do período',
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
        },
        {
            id: 'appointments' as ReportType,
            name: 'Relatório de Agendamentos',
            description: 'Agendamentos e consultas realizadas',
            icon: Calendar,
            color: 'from-blue-500 to-blue-600',
        },
        {
            id: 'patients' as ReportType,
            name: 'Relatório de Pacientes',
            description: 'Novos pacientes e estatísticas',
            icon: Users,
            color: 'from-purple-500 to-purple-600',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Relatórios</h1>
                <p className="text-gray-700">Gere relatórios detalhados sobre sua clínica</p>
            </div>

            {/* Quick Report Types */}
            <div className="grid gap-6 md:grid-cols-3">
                {reportTypes.map((report) => {
                    const Icon = report.icon;
                    const isLoading = loading === `${report.id}-quick`;

                    return (
                        <Card key={report.id} className="hover:scale-105 transition-transform duration-300">
                            <CardContent className="p-6">
                                <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${report.color} mb-4`}>
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.name}</h3>
                                <p className="text-sm text-gray-700 mb-4">{report.description}</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => generateReport(report.id, true)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Printer className="h-4 w-4 mr-2" />
                                            Gerar Relatório
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Custom Report */}
            <Card>
                <CardHeader>
                    <CardTitle>Relatório Personalizado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Relatório
                            </label>
                            <select
                                className="input-premium w-full"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as ReportType)}
                            >
                                <option value="financial">Financeiro</option>
                                <option value="appointments">Agendamentos</option>
                                <option value="patients">Pacientes</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Data Inicial
                                </label>
                                <input
                                    type="date"
                                    className="input-premium w-full"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Data Final
                                </label>
                                <input
                                    type="date"
                                    className="input-premium w-full"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <Button
                                className="w-full"
                                onClick={() => generateReport(reportType)}
                                disabled={loading === 'custom'}
                            >
                                {loading === 'custom' ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <Printer className="h-5 w-5 mr-2" />
                                )}
                                Gerar e Imprimir Relatório
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
