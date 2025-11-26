'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadDialog } from '@/components/leads/lead-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserPlus, Search, Plus, Phone, Mail, TrendingUp, ArrowRight, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    source: string;
    status: string;
    notes?: string | null;
    createdAt: Date;
}

const statusConfig = {
    NEW: { label: 'Novo', variant: 'info' as const, color: 'blue' },
    CONTACTED: { label: 'Contatado', variant: 'warning' as const, color: 'yellow' },
    QUALIFIED: { label: 'Qualificado', variant: 'success' as const, color: 'green' },
    CONVERTED: { label: 'Convertido', variant: 'success' as const, color: 'primary' },
    LOST: { label: 'Perdido', variant: 'danger' as const, color: 'red' },
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
    const [loading, setLoading] = useState(true);
    const [leadDialogOpen, setLeadDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const url = searchTerm
                ? `/api/leads?search=${encodeURIComponent(searchTerm)}`
                : '/api/leads';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setLeads(data);
            } else {
                toast.error('Erro ao carregar leads');
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            toast.error('Erro ao carregar leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [searchTerm]);

    const handleNewLead = () => {
        setSelectedLead(undefined);
        setLeadDialogOpen(true);
    };

    const handleEditLead = (lead: Lead) => {
        setSelectedLead(lead);
        setLeadDialogOpen(true);
    };

    const handleDeleteLead = (id: string) => {
        setLeadToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!leadToDelete) return;

        try {
            const response = await fetch(`/api/leads/${leadToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Lead excluído com sucesso!');
                fetchLeads();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao excluir lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            toast.error('Erro ao excluir lead');
        } finally {
            setConfirmDialogOpen(false);
            setLeadToDelete(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDialogOpen(false);
        setLeadToDelete(null);
    };

    const handleConvertLead = async (id: string) => {
        try {
            const response = await fetch(`/api/leads/${id}/convert`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Lead convertido em paciente com sucesso!');
                fetchLeads();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao converter lead');
            }
        } catch (error) {
            console.error('Error converting lead:', error);
            toast.error('Erro ao converter lead');
        }
    };

    const handleSuccess = () => {
        fetchLeads();
    };

    // Calculate stats
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
    const activeLeads = leads.filter(l => !['CONVERTED', 'LOST'].includes(l.status)).length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    const pipelineStages = [
        { status: 'NEW', count: leads.filter(l => l.status === 'NEW').length },
        { status: 'CONTACTED', count: leads.filter(l => l.status === 'CONTACTED').length },
        { status: 'QUALIFIED', count: leads.filter(l => l.status === 'QUALIFIED').length },
        { status: 'CONVERTED', count: leads.filter(l => l.status === 'CONVERTED').length },
    ];

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Leads</h1>
                    <p className="text-gray-700">Gerencie e converta seus leads em pacientes</p>
                </div>
                <Button className="gap-2" onClick={handleNewLead}>
                    <Plus className="h-5 w-5" />
                    Novo Lead
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Total de Leads</p>
                                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Convertidos</p>
                                <p className="text-2xl font-bold text-gray-900">{convertedLeads}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Em Andamento</p>
                                <p className="text-2xl font-bold text-gray-900">{activeLeads}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Taxa de Conversão</p>
                                <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* View Toggle and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                Lista
                            </Button>
                            <Button
                                variant={viewMode === 'pipeline' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('pipeline')}
                            >
                                Pipeline
                            </Button>
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou telefone..."
                                    className="input-premium w-full pl-12"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
            ) : viewMode === 'pipeline' ? (
                /* Pipeline View */
                <div className="grid gap-6 md:grid-cols-4">
                    {pipelineStages.map((stage) => (
                        <Card key={stage.status}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{statusConfig[stage.status as keyof typeof statusConfig].label}</span>
                                    <Badge variant={statusConfig[stage.status as keyof typeof statusConfig].variant}>{stage.count}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {filteredLeads
                                    .filter(lead => lead.status === stage.status)
                                    .map((lead) => (
                                        <div key={lead.id} className="p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer">
                                            <h3 className="font-semibold text-gray-900 mb-2">{lead.name}</h3>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                                    <Phone className="h-3 w-3" />
                                                    {lead.phone}
                                                </div>
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-700">
                                                        <Mail className="h-3 w-3" />
                                                        {lead.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* List View */
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Nenhum lead encontrado
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                                                <span className="text-sm font-semibold text-white">
                                                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Phone className="h-3 w-3" />
                                                        {lead.phone}
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Mail className="h-3 w-3" />
                                                            {lead.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={statusConfig[lead.status as keyof typeof statusConfig]?.variant || 'default'}>
                                                {statusConfig[lead.status as keyof typeof statusConfig]?.label || lead.status}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleEditLead(lead)}
                                                    title="Editar lead"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {lead.status !== 'CONVERTED' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleConvertLead(lead.id)}
                                                        title="Converter em paciente"
                                                    >
                                                        Converter
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleDeleteLead(lead.id)}
                                                    title="Excluir lead"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            <LeadDialog
                open={leadDialogOpen}
                onOpenChange={setLeadDialogOpen}
                lead={selectedLead}
                onSuccess={handleSuccess}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                title="Excluir Lead"
                message="Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita."
            />
        </div>
    );
}
