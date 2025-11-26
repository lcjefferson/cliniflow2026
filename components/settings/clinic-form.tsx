"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const clinicSchema = z.object({
    name: z.string().min(1, "Nome da clínica é obrigatório"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    cnpj: z.string().optional(),
    description: z.string().optional(),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export function ClinicForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ClinicFormData>({
        resolver: zodResolver(clinicSchema),
    });

    const fetchClinicSettings = useCallback(async () => {
        try {
            const response = await fetch("/api/settings/clinic");
            if (response.ok) {
                const data = await response.json();
                reset(data);
            }
        } catch (error) {
            console.error("Error fetching clinic settings:", error);
            toast.error("Erro ao carregar configurações da clínica");
        } finally {
            setLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        fetchClinicSettings();
    }, [fetchClinicSettings]);

    const onSubmit = async (data: ClinicFormData) => {
        try {
            setSaving(true);
            const response = await fetch("/api/settings/clinic", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Configurações salvas com sucesso!");
            } else {
                toast.error("Erro ao salvar configurações");
            }
        } catch (error) {
            console.error("Error saving clinic settings:", error);
            toast.error("Erro ao salvar configurações");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Dados da Clínica
                    </CardTitle>
                    <CardDescription>
                        Essas informações serão utilizadas no cabeçalho de documentos impressos (Receitas e Atestados).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Clínica *</Label>
                            <Input id="name" {...register("name")} placeholder="Ex: Clínica Sorriso" />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" {...register("cnpj")} placeholder="00.000.000/0000-00" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} placeholder="contato@clinica.com" />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" {...register("address")} placeholder="Rua Exemplo, 123" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input id="city" {...register("city")} placeholder="São Paulo" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                            <Input id="state" {...register("state")} placeholder="SP" maxLength={2} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zipCode">CEP</Label>
                            <Input id="zipCode" {...register("zipCode")} placeholder="00000-000" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição / Slogan</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Ex: Especialistas em Ortodontia e Implantes"
                            className="min-h-[80px]"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
