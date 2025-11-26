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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const passwordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    isOwnAccount: boolean;
}

export function PasswordDialog({ open, onOpenChange, userId, isOwnAccount }: PasswordDialogProps) {
    const [saving, setSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: PasswordFormData) => {
        try {
            setSaving(true);

            const response = await fetch(`/api/users/${userId}/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao alterar senha');
            }

            toast.success('Senha alterada com sucesso!');
            onOpenChange(false);
            reset();
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast.error(error.message || 'Erro ao alterar senha');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {isOwnAccount && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha Atual
                            </label>
                            <div className="relative">
                                <input
                                    {...register('currentPassword')}
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    className="input-premium w-full pr-10"
                                    placeholder="Digite sua senha atual"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <input
                                {...register('newPassword')}
                                type={showNewPassword ? 'text' : 'password'}
                                className="input-premium w-full pr-10"
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                        </label>
                        <div className="relative">
                            <input
                                {...register('confirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="input-premium w-full pr-10"
                                placeholder="Digite a senha novamente"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
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
                                    Alterando...
                                </>
                            ) : (
                                'Alterar Senha'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
