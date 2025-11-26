"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { professionalSchema, type ProfessionalFormData } from "@/lib/validations/professional";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProfessionalFormProps {
    professional?: ProfessionalFormData & { id: string };
    onSuccess: () => void;
    onCancel: () => void;
}

export function ProfessionalForm({ professional, onSuccess, onCancel }: ProfessionalFormProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfessionalFormData>({
        resolver: zodResolver(professionalSchema),
        defaultValues: professional || {
            name: "",
            email: "",
            phone: "",
            specialty: "",
            cro: "",
        },
    });

    const onSubmit = async (data: ProfessionalFormData) => {
        try {
            setLoading(true);
            const url = professional
                ? `/api/professionals/${professional.id}`
                : "/api/professionals";
            const method = professional ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                onSuccess();
            } else {
                console.error("Error saving professional");
            }
        } catch (error) {
            console.error("Error saving professional:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" {...register("name")} placeholder="Nome completo" />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
                {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input id="specialty" {...register("specialty")} placeholder="Ex: Ortodontia" />
                {errors.specialty && (
                    <p className="text-sm text-red-500">{errors.specialty.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="cro">CRO</Label>
                <Input id="cro" {...register("cro")} placeholder="Número do CRO" />
                {errors.cro && (
                    <p className="text-sm text-red-500">{errors.cro.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        professional ? "Atualizar" : "Criar"
                    )}
                </Button>
            </div>
        </form>
    );
}
