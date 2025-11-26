'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserDialog } from '@/components/users/user-dialog';
import { PasswordDialog } from '@/components/users/password-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserCog, Plus, Mail, Shield, Edit, Trash2, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: Date;
}

const roleLabels = {
    ADMIN: { label: 'Administrador', variant: 'danger' as const },
    DENTIST: { label: 'Dentista', variant: 'success' as const },
    RECEPTIONIST: { label: 'Recepcionista', variant: 'info' as const },
    ASSISTANT: { label: 'Assistente', variant: 'default' as const },
};

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [passwordUserId, setPasswordUserId] = useState<string>('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                toast.error('Erro ao carregar usuários');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleNewUser = () => {
        setSelectedUser(undefined);
        setUserDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setUserDialogOpen(true);
    };

    const handleChangePassword = (userId: string) => {
        setPasswordUserId(userId);
        setPasswordDialogOpen(true);
    };

    const handleDeleteUser = (id: string) => {
        setUserToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/users/${userToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Usuário desativado com sucesso!');
                fetchUsers();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Erro ao desativar usuário');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Erro ao desativar usuário');
        } finally {
            setConfirmDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDialogOpen(false);
        setUserToDelete(null);
    };

    const handleSuccess = () => {
        fetchUsers();
    };

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.active).length;
    const adminUsers = users.filter(u => u.role === 'ADMIN').length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Usuários</h1>
                    <p className="text-gray-700">Gerencie os usuários do sistema</p>
                </div>
                <Button className="gap-2" onClick={handleNewUser}>
                    <Plus className="h-5 w-5" />
                    Novo Usuário
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                                <UserCog className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Total de Usuários</p>
                                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                                <UserCog className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Administradores</p>
                                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                                <UserCog className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700">Inativos</p>
                                <p className="text-2xl font-bold text-gray-900">{totalUsers - activeUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum usuário encontrado
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="pb-4 text-left text-sm font-medium text-gray-700">Usuário</th>
                                        <th className="pb-4 text-left text-sm font-medium text-gray-700">Email</th>
                                        <th className="pb-4 text-left text-sm font-medium text-gray-700">Função</th>
                                        <th className="pb-4 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="pb-4 text-left text-sm font-medium text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                                                        <span className="text-sm font-semibold text-white">
                                                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Mail className="h-4 w-4" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant={roleLabels[user.role as keyof typeof roleLabels]?.variant || 'default'}>
                                                    {roleLabels[user.role as keyof typeof roleLabels]?.label || user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant={user.active ? 'success' : 'default'}>
                                                    {user.active ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleEditUser(user)}
                                                        title="Editar usuário"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleChangePassword(user.id)}
                                                        title="Alterar senha"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={session?.user?.id === user.id}
                                                        title={session?.user?.id === user.id ? 'Não é possível desativar sua própria conta' : 'Desativar usuário'}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <UserDialog
                open={userDialogOpen}
                onOpenChange={setUserDialogOpen}
                user={selectedUser}
                onSuccess={handleSuccess}
            />

            <PasswordDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
                userId={passwordUserId}
                isOwnAccount={session?.user?.id === passwordUserId}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                title="Desativar Usuário"
                message="Tem certeza que deseja desativar este usuário? O usuário não poderá mais acessar o sistema."
            />
        </div>
    );
}
