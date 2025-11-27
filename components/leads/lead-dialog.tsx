'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const leadSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    phone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    source: z.enum(['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'WEBSITE', 'INDICACAO', 'OMNICHANNEL']),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']),
    notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    source: string;
    status: string;
    notes?: string | null;
}

interface LeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead;
    onSuccess: () => void;
}

const sourceLabels = {
    WHATSAPP: 'WhatsApp',
    INSTAGRAM: 'Instagram',
    FACEBOOK: 'Facebook',
    WEBSITE: 'Website',
    INDICACAO: 'Indicação',
    OMNICHANNEL: 'Omnichannel',
};

const statusLabels = {
    NEW: 'Novo',
    CONTACTED: 'Contatado',
    QUALIFIED: 'Qualificado',
    CONVERTED: 'Convertido',
    LOST: 'Perdido',
};

export function LeadDialog({ open, onOpenChange, lead, onSuccess }: LeadDialogProps) {
    const [saving, setSaving] = useState(false);
    const isEditing = !!lead;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LeadFormData>({
        resolver: zodResolver(leadSchema),
        defaultValues: lead
            ? {
                name: lead.name,
                phone: lead.phone,
                email: lead.email || '',
                source: lead.source as LeadFormData['source'],
                status: lead.status as LeadFormData['status'],
                notes: lead.notes || '',
            }
            : {
                name: '',
                phone: '',
                email: '',
                source: 'OMNICHANNEL',
                status: 'NEW',
                notes: '',
            },
    });

    // Ensure form fields reflect the selected lead when editing
    // and avoid stale values when switching between leads
    useEffect(() => {
        if (lead) {
            const values: LeadFormData = {
                name: lead.name,
                phone: lead.phone,
                email: lead.email || '',
                source: lead.source as LeadFormData['source'],
                status: lead.status as LeadFormData['status'],
                notes: lead.notes || '',
            };
            reset(values);
        } else {
            reset({ name: '', phone: '', email: '', source: 'OMNICHANNEL', status: 'NEW', notes: '' });
        }
    }, [lead, reset]);

    const onSubmit = async (data: LeadFormData) => {
        try {
            setSaving(true);

            const url = isEditing ? `/api/leads/${lead.id}` : '/api/leads';
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao salvar lead');
            }

            toast.success(isEditing ? 'Lead atualizado com sucesso!' : 'Lead criado com sucesso!');
            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error) {
            console.error('Error saving lead:', error);
            const msg = error instanceof Error ? error.message : 'Erro ao salvar lead';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo
                        </label>
                        <input
                            {...register('name')}
                            className="input-premium w-full"
                            placeholder="Digite o nome completo"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone
                        </label>
                        <input
                            {...register('phone')}
                            className="input-premium w-full"
                            placeholder="(11) 99999-9999"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email (opcional)
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            className="input-premium w-full"
                            placeholder="email@exemplo.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Origem
                        </label>
                        <select {...register('source')} className="input-premium w-full">
                            {Object.entries(sourceLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {errors.source && (
                            <p className="text-red-500 text-xs mt-1">{errors.source.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select {...register('status')} className="input-premium w-full">
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {errors.status && (
                            <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea
                            {...register('notes')}
                            className="input-premium w-full"
                            rows={3}
                            placeholder="Observações sobre o lead..."
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                onOpenChange(false);
                                reset();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                isEditing ? 'Atualizar' : 'Criar Lead'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
