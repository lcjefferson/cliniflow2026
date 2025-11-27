'use client';

import { useState } from 'react';
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
import { Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

const followUpSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    trigger: z.enum([
        'LEAD_CREATED',
        'LEAD_CONTACTED',
        'LEAD_QUALIFIED',
        'PATIENT_CREATED',
        'APPOINTMENT_SCHEDULED',
        'APPOINTMENT_COMPLETED',
        'APPOINTMENT_REMINDER',
        'BIRTHDAY',
    ]),
    targetType: z.enum(['LEAD', 'PATIENT']),
    delay: z.number().min(-365, 'Delay mínimo é -365 dias').max(365, 'Delay máximo é 365 dias'),
    messageTemplate: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
    active: z.boolean(),
});

type FollowUpFormData = z.infer<typeof followUpSchema>;

interface FollowUp {
    id: string;
    name: string;
    description?: string | null;
    trigger: string;
    targetType: string;
    delay: number | null;
    messageTemplate: string;
    active: boolean;
}

interface FollowUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    followUp?: FollowUp;
    onSuccess: () => void;
}

const triggerLabels = {
    LEAD_CREATED: 'Lead Criado',
    LEAD_CONTACTED: 'Lead Contatado',
    LEAD_QUALIFIED: 'Lead Qualificado',
    PATIENT_CREATED: 'Paciente Criado',
    APPOINTMENT_SCHEDULED: 'Consulta Agendada',
    APPOINTMENT_COMPLETED: 'Consulta Concluída',
    APPOINTMENT_REMINDER: 'Lembrete de Consulta',
    BIRTHDAY: 'Aniversário',
};

const targetTypeLabels = {
    LEAD: 'Leads',
    PATIENT: 'Pacientes',
};

const messageVariables = [
    { var: '{nome}', desc: 'Nome do lead/paciente' },
    { var: '{clinica}', desc: 'Nome da clínica' },
    { var: '{data}', desc: 'Data do evento' },
    { var: '{hora}', desc: 'Hora do evento' },
    { var: '{profissional}', desc: 'Nome do profissional' },
];

export function FollowUpDialog({ open, onOpenChange, followUp, onSuccess }: FollowUpDialogProps) {
    const [saving, setSaving] = useState(false);
    const isEditing = !!followUp;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FollowUpFormData>({
        resolver: zodResolver(followUpSchema),
        defaultValues: followUp
            ? {
                name: followUp.name,
                description: followUp.description || '',
                trigger: followUp.trigger as FollowUpFormData['trigger'],
                targetType: followUp.targetType as FollowUpFormData['targetType'],
                delay: followUp.delay || 0,
                messageTemplate: followUp.messageTemplate,
                active: followUp.active,
            }
            : {
                name: '',
                description: '',
                trigger: 'LEAD_CREATED',
                targetType: 'LEAD',
                delay: 0,
                messageTemplate: '',
                active: true,
            },
    });

    const messageTemplate = watch('messageTemplate');

    const insertVariable = (variable: string) => {
        const currentMessage = messageTemplate || '';
        setValue('messageTemplate', currentMessage + variable);
    };

    const onSubmit = async (data: FollowUpFormData) => {
        try {
            setSaving(true);

            const url = isEditing ? `/api/follow-ups/${followUp.id}` : '/api/follow-ups';
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao salvar follow-up');
            }

            toast.success(isEditing ? 'Follow-up atualizado!' : 'Follow-up criado!');
            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error) {
            console.error('Error saving follow-up:', error);
            const msg = error instanceof Error ? error.message : 'Erro ao salvar follow-up';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Follow-Up' : 'Novo Follow-Up'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Regra
                        </label>
                        <input
                            {...register('name')}
                            className="input-premium w-full"
                            placeholder="Ex: Boas-vindas para novos leads"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição (opcional)
                        </label>
                        <input
                            {...register('description')}
                            className="input-premium w-full"
                            placeholder="Descrição da regra"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gatilho
                            </label>
                            <select {...register('trigger')} className="input-premium w-full">
                                {Object.entries(triggerLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {errors.trigger && (
                                <p className="text-red-500 text-xs mt-1">{errors.trigger.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Destinatário
                            </label>
                            <select {...register('targetType')} className="input-premium w-full">
                                {Object.entries(targetTypeLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {errors.targetType && (
                                <p className="text-red-500 text-xs mt-1">{errors.targetType.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delay (dias antes ou depois do gatilho)
                        </label>
                        <input
                            {...register('delay', { valueAsNumber: true })}
                            type="number"
                            min="-365"
                            max="365"
                            className="input-premium w-full"
                            placeholder="0 = imediato"
                        />
                        {errors.delay && (
                            <p className="text-red-500 text-xs mt-1">{errors.delay.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Valores positivos = depois (ex: 1 = 1 dia depois) • Valores negativos = antes (ex: -1 = 1 dia antes)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mensagem
                        </label>
                        <textarea
                            {...register('messageTemplate')}
                            className="input-premium w-full"
                            rows={6}
                            placeholder="Digite a mensagem que será enviada..."
                        />
                        {errors.messageTemplate && (
                            <p className="text-red-500 text-xs mt-1">{errors.messageTemplate.message}</p>
                        )}
                    </div>

                    {/* Variable Helper */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Variáveis Disponíveis</p>
                                <p className="text-xs text-blue-700">Clique para inserir na mensagem</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {messageVariables.map((v) => (
                                <button
                                    key={v.var}
                                    type="button"
                                    onClick={() => insertVariable(v.var)}
                                    className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-mono text-blue-900 hover:bg-blue-100 transition-colors"
                                    title={v.desc}
                                >
                                    {v.var}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            {...register('active')}
                            type="checkbox"
                            id="active"
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="active" className="text-sm text-gray-700">
                            Regra ativa
                        </label>
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
                                isEditing ? 'Atualizar' : 'Criar Follow-Up'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
