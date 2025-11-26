'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, Phone, Mail, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProfessionalDialog } from '@/components/professionals/professional-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface Professional {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    specialty?: string | null;
    cro?: string | null;
    active: boolean;
}

export default function ProfessionalsPage() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [professionalToDelete, setProfessionalToDelete] = useState<string | null>(null);

    const fetchProfessionals = async () => {
        try {
            const response = await fetch('/api/professionals');
            if (response.ok) {
                const data = await response.json();
                setProfessionals(data);
            }
        } catch (error) {
            console.error('Error fetching professionals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const handleNew = () => {
        setSelectedProfessional(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (professional: Professional) => {
        setSelectedProfessional(professional);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setProfessionalToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!professionalToDelete) return;

        try {
            const response = await fetch(`/api/professionals/${professionalToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Profissional excluído com sucesso!');
                fetchProfessionals();
            } else {
                toast.error('Erro ao excluir profissional');
            }
        } catch (error) {
            console.error('Error deleting professional:', error);
            toast.error('Erro ao excluir profissional');
        } finally {
            setConfirmDialogOpen(false);
            setProfessionalToDelete(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDialogOpen(false);
        setProfessionalToDelete(null);
    };

    const handleSuccess = () => {
        fetchProfessionals();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Profissionais</h1>
                    <p className="text-gray-700">Gerencie os profissionais da clínica</p>
                </div>
                <Button className="gap-2" onClick={handleNew}>
                    <Plus className="h-5 w-5" />
                    Novo Profissional
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                <Stethoscope className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{professionals.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                                <Stethoscope className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {professionals.filter(p => p.active).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Professionals Grid */}
            {professionals.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum profissional cadastrado</h3>
                        <p className="text-gray-700 mb-4">Comece adicionando um novo profissional à clínica</p>
                        <Button onClick={handleNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Profissional
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {professionals.map((professional) => (
                        <Card key={professional.id} className="hover:scale-105 transition-transform duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                            <span className="text-xl font-semibold text-white">
                                                {professional.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{professional.name}</h3>
                                            <Badge variant={professional.active ? 'success' : 'default'}>
                                                {professional.active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {professional.specialty && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Stethoscope className="h-4 w-4 text-blue-500" />
                                            <span>{professional.specialty}</span>
                                        </div>
                                    )}
                                    {professional.cro && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Badge variant="default" className="text-xs">{professional.cro}</Badge>
                                        </div>
                                    )}
                                    {professional.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Phone className="h-4 w-4 text-blue-500" />
                                            <span>{professional.phone}</span>
                                        </div>
                                    )}
                                    {professional.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Mail className="h-4 w-4 text-blue-500" />
                                            <span>{professional.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(professional)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(professional.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ProfessionalDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                professional={selectedProfessional}
                onSuccess={handleSuccess}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Excluir Profissional"
                message="Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
