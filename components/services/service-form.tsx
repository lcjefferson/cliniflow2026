"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormData } from "@/lib/validations/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ServiceFormProps {
    service?: ServiceFormData & { id: string };
    onSuccess: () => void;
    onCancel: () => void;
}

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: service || {
            name: "",
            description: "",
            price: "",
            duration: "",
            category: "",
        },
    });

    const onSubmit = async (data: ServiceFormData) => {
        try {
            setLoading(true);
            const url = service
                ? `/api/services/${service.id}`
                : "/api/services";
            const method = service ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                onSuccess();
            } else {
                console.error("Error saving service");
            }
        } catch (error) {
            console.error("Error saving service:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" {...register("name")} placeholder="Nome do serviço" />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" {...register("description")} placeholder="Descrição do serviço" rows={3} />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input id="price" type="number" step="0.01" {...register("price")} placeholder="0.00" />
                    {errors.price && (
                        <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min) *</Label>
                    <Input id="duration" type="number" {...register("duration")} placeholder="60" />
                    {errors.duration && (
                        <p className="text-sm text-red-500">{errors.duration.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" {...register("category")} placeholder="Ex: Ortodontia" />
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
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
                        service ? "Atualizar" : "Criar"
                    )}
                </Button>
            </div>
        </form>
    );
}
