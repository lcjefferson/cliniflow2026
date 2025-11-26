'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Clock, DollarSign, Edit, Trash2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ServiceDialog } from '@/components/services/service-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface Service {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    duration: number;
    category?: string | null;
    active: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleNew = () => {
        setSelectedService(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setServiceToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete) return;

        try {
            const response = await fetch(`/api/services/${serviceToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Serviço excluído com sucesso!');
                fetchServices();
            } else {
                toast.error('Erro ao excluir serviço');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('Erro ao excluir serviço');
        } finally {
            setConfirmDialogOpen(false);
            setServiceToDelete(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDialogOpen(false);
        setServiceToDelete(null);
    };

    const handleSuccess = () => {
        fetchServices();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const avgPrice = services.length > 0
        ? services.reduce((sum, s) => sum + s.price, 0) / services.length
        : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Serviços</h1>
                    <p className="text-gray-700">Gerencie os serviços oferecidos pela clínica</p>
                </div>
                <Button className="gap-2" onClick={handleNew}>
                    <Plus className="h-5 w-5" />
                    Novo Serviço
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Total de Serviços</p>
                                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {services.filter(s => s.active).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Preço Médio</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgPrice)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Services Grid */}
            {services.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
                        <p className="text-gray-700 mb-4">Comece adicionando um novo serviço à clínica</p>
                        <Button onClick={handleNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Serviço
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <Card key={service.id} className="hover:scale-105 transition-transform duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                            <Badge variant={service.active ? 'success' : 'default'}>
                                                {service.active ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                        {service.category && (
                                            <Badge variant="default" className="text-xs">{service.category}</Badge>
                                        )}
                                    </div>
                                </div>

                                {service.description && (
                                    <p className="text-sm text-gray-700 mb-4">{service.description}</p>
                                )}

                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-700">Valor</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-gray-700">Duração</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{service.duration} min</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(service)}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(service.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ServiceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                service={selectedService}
                onSuccess={handleSuccess}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                title="Excluir Serviço"
                message="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
