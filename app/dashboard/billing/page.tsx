'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const mockPayments = [
    { id: 1, patient: 'Maria Silva', amount: 450, type: 'income', status: 'paid', method: 'pix', date: '2024-01-20', description: 'Limpeza Dental' },
    { id: 2, patient: 'Pedro Santos', amount: 800, type: 'income', status: 'pending', method: 'credit_card', date: '2024-01-22', description: 'Clareamento' },
    { id: 3, patient: null, amount: 1200, type: 'expense', status: 'paid', method: 'bank_transfer', date: '2024-01-18', description: 'Material Odontológico' },
    { id: 4, patient: 'Julia Costa', amount: 350, type: 'income', status: 'overdue', method: 'cash', date: '2024-01-15', description: 'Consulta' },
    { id: 5, patient: 'Roberto Lima', amount: 1500, type: 'income', status: 'paid', method: 'pix', date: '2024-01-19', description: 'Implante' },
];

const statusConfig = {
    paid: { label: 'Pago', variant: 'success' as const },
    pending: { label: 'Pendente', variant: 'warning' as const },
    overdue: { label: 'Atrasado', variant: 'danger' as const },
    cancelled: { label: 'Cancelado', variant: 'default' as const },
};

const methodLabels = {
    cash: 'Dinheiro',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    pix: 'PIX',
    bank_transfer: 'Transferência',
    check: 'Cheque',
};

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

    const filteredPayments = activeTab === 'all'
        ? mockPayments
        : mockPayments.filter(p => p.type === activeTab);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Faturamento</h1>
                    <p className="text-gray-700">Gerencie pagamentos e despesas da clínica</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-5 w-5" />
                    Novo Lançamento
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Receitas (mês)</p>
                                <p className="text-2xl font-bold text-gray-900">R$ 45.890</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                                <TrendingDown className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Despesas (mês)</p>
                                <p className="text-2xl font-bold text-gray-900">R$ 12.340</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Lucro (mês)</p>
                                <p className="text-2xl font-bold text-gray-900">R$ 33.550</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">A Receber</p>
                                <p className="text-2xl font-bold text-gray-900">R$ 8.450</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'all' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveTab('all')}
                            >
                                Todos
                            </Button>
                            <Button
                                variant={activeTab === 'income' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveTab('income')}
                            >
                                Receitas
                            </Button>
                            <Button
                                variant={activeTab === 'expense' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveTab('expense')}
                            >
                                Despesas
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Período
                            </Button>
                            <Button variant="secondary" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lançamentos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Data</th>
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Descrição</th>
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Paciente</th>
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Tipo</th>
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Método</th>
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Valor</th>
                                    <th className="pb-4 text-left text-sm font-medium text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 text-sm text-gray-700">{payment.date}</td>
                                        <td className="py-4 text-sm text-gray-900 font-medium">{payment.description}</td>
                                        <td className="py-4 text-sm text-gray-700">{payment.patient || '-'}</td>
                                        <td className="py-4">
                                            <Badge variant={payment.type === 'income' ? 'success' : 'danger'}>
                                                {payment.type === 'income' ? 'Receita' : 'Despesa'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm text-gray-700">{methodLabels[payment.method as keyof typeof methodLabels]}</td>
                                        <td className="py-4">
                                            <span className={`text-lg font-bold ${payment.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {payment.type === 'income' ? '+' : '-'} {formatCurrency(payment.amount)}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <Badge variant={statusConfig[payment.status as keyof typeof statusConfig].variant}>
                                                {statusConfig[payment.status as keyof typeof statusConfig].label}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
