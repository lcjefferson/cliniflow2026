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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const userSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
    role: z.enum(['ADMIN', 'DENTIST', 'RECEPTIONIST', 'ASSISTANT']),
    active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
}

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User;
    onSuccess: () => void;
}

const roleLabels = {
    ADMIN: 'Administrador',
    DENTIST: 'Dentista',
    RECEPTIONIST: 'Recepcionista',
    ASSISTANT: 'Assistente',
};

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
    const [saving, setSaving] = useState(false);
    const isEditing = !!user;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: user
            ? {
                name: user.name,
                email: user.email,
                role: user.role as any,
                active: user.active,
            }
            : {
                name: '',
                email: '',
                password: '',
                role: 'RECEPTIONIST',
                active: true,
            },
    });

    const onSubmit = async (data: UserFormData) => {
        try {
            setSaving(true);

            const url = isEditing ? `/api/users/${user.id}` : '/api/users';
            const method = isEditing ? 'PATCH' : 'POST';

            // Don't send password when editing
            const payload = isEditing
                ? { name: data.name, email: data.email, role: data.role, active: data.active }
                : data;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao salvar usuário');
            }

            toast.success(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            console.error('Error saving user:', error);
            toast.error(error.message || 'Erro ao salvar usuário');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
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
                            Email
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

                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                className="input-premium w-full"
                                placeholder="Mínimo 6 caracteres"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Função
                        </label>
                        <select {...register('role')} className="input-premium w-full">
                            {Object.entries(roleLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            {...register('active')}
                            type="checkbox"
                            id="active"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">
                            Usuário ativo
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
                                isEditing ? 'Atualizar' : 'Criar Usuário'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
