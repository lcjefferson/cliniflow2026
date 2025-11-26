'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FollowUpDialog } from '@/components/follow-up/follow-up-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Edit, Trash2, Loader2, TrendingUp, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FollowUp {
    id: string;
    name: string;
    description?: string | null;
    trigger: string;
    targetType: string;
    delay: number | null;
    messageTemplate: string;
    active: boolean;
    stats?: {
        total: number;
        pending: number;
        sent: number;
        failed: number;
    };
}

const triggerLabels: Record<string, string> = {
    LEAD_CREATED: 'Lead Criado',
    LEAD_CONTACTED: 'Lead Contatado',
    LEAD_QUALIFIED: 'Lead Qualificado',
    PATIENT_CREATED: 'Paciente Criado',
    APPOINTMENT_SCHEDULED: 'Consulta Agendada',
    APPOINTMENT_COMPLETED: 'Consulta Concluída',
    APPOINTMENT_REMINDER: 'Lembrete de Consulta',
    BIRTHDAY: 'Aniversário',
};

export default function FollowUpPage() {
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [followUpToDelete, setFollowUpToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/follow-ups');
            if (response.ok) {
                const data = await response.json();
                setFollowUps(data);
            } else {
                toast.error('Erro ao carregar follow-ups');
            }
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            toast.error('Erro ao carregar follow-ups');
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
        setSelectedFollowUp(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (followUp: FollowUp) => {
        setSelectedFollowUp(followUp);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setFollowUpToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!followUpToDelete) return;

        try {
            const response = await fetch(`/api/follow-ups/${followUpToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Follow-up excluído!');
                fetchFollowUps();
            } else {
                toast.error('Erro ao excluir');
            }
        } catch (error) {
            toast.error('Erro ao excluir');
        } finally {
            setConfirmDialogOpen(false);
            setFollowUpToDelete(null);
        }
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        try {
            const response = await fetch(`/api/follow-ups/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentActive }),
            });

            if (response.ok) {
                toast.success(`Follow-up ${!currentActive ? 'ativado' : 'desativado'}!`);
                fetchFollowUps();
            } else {
                toast.error('Erro ao atualizar');
            }
        } catch (error) {
            toast.error('Erro ao atualizar');
        }
    };

    const totalStats = followUps.reduce(
        (acc, fu) => ({
            total: acc.total + (fu.stats?.total || 0),
            pending: acc.pending + (fu.stats?.pending || 0),
            sent: acc.sent + (fu.stats?.sent || 0),
            failed: acc.failed + (fu.stats?.failed || 0),
        }),
        { total: 0, pending: 0, sent: 0, failed: 0 }
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Follow-Up Automático</h1>
                    <p className="text-gray-600">Automatize mensagens para leads e pacientes</p>
                </div>
                <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Agendados</p>
                                <p className="text-2xl font-bold">{totalStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">Pendentes</p>
                                <p className="text-2xl font-bold">{totalStats.pending}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Enviados</p>
                                <p className="text-2xl font-bold">{totalStats.sent}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                            <div>
                                <p className="text-sm text-gray-600">Falhas</p>
                                <p className="text-2xl font-bold">{totalStats.failed}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Regras de Follow-Up</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : followUps.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhuma regra de follow-up criada</p>
                            <p className="text-sm mt-2">Crie sua primeira regra para automatizar mensagens</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {followUps.map((fu) => (
                                <div key={fu.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{fu.name}</h3>
                                            <Badge variant={fu.active ? 'success' : 'default'}>
                                                {fu.active ? 'Ativa' : 'Inativa'}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span>{triggerLabels[fu.trigger]} • </span>
                                            <span>
                                                {fu.delay === null || fu.delay === 0
                                                    ? 'Imediato'
                                                    : fu.delay > 0
                                                        ? `${fu.delay} dia(s) depois`
                                                        : `${Math.abs(fu.delay)} dia(s) antes`
                                                } •
                                            </span>
                                            <span>{fu.targetType === 'LEAD' ? 'Leads' : 'Pacientes'}</span>
                                        </div>
                                        {fu.stats && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {fu.stats.pending} pendentes • {fu.stats.sent} enviados
                                                {fu.stats.failed > 0 && ` • ${fu.stats.failed} falhas`}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleToggleActive(fu.id, fu.active)}
                                        >
                                            {fu.active ? 'Desativar' : 'Ativar'}
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(fu)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleDelete(fu.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <FollowUpDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                followUp={selectedFollowUp}
                onSuccess={fetchFollowUps}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialogOpen(false)}
                title="Excluir Follow-Up"
                message="Tem certeza que deseja excluir esta regra? As execuções pendentes serão canceladas."
            />
        </div>
    );
}
