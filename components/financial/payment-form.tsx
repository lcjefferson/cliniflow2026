"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface Patient {
  id: string;
  name: string;
}

const paymentSchema = z.object({
    amount: z.string().min(1, "Valor é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    patientId: z.string().optional(),
    dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
    type: z.enum(["INCOME", "EXPENSE"]),
    method: z.string().optional(),
    status: z.enum(["PENDING", "PAID"]),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
    onSuccess: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<{ value: string; label: string }[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            type: "INCOME",
            status: "PENDING",
            dueDate: new Date().toISOString().slice(0, 10),
        },
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch("/api/patients");
            if (response.ok) {
                const data: Patient[] = await response.json();
                setPatients(
                    data.map((p) => ({
                        value: p.id,
                        label: p.name,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const onSubmit = async (data: PaymentFormData) => {
        try {
            setLoading(true);
            const response = await fetch("/api/financial/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("Pagamento registrado com sucesso!");
                // Force reload of the page to update lists/stats
                // Ideally we would use a context or SWR/React Query, but this is simpler for now
                window.location.reload();
                onSuccess();
            } else {
                toast.error("Erro ao registrar pagamento");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error("Erro ao registrar pagamento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                    onValueChange={(value) => setValue("type", value as "INCOME" | "EXPENSE")}
                    defaultValue="INCOME"
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Paciente (Opcional)</Label>
                <SearchableSelect
                    options={patients}
                    value={watch("patientId") || ""}
                    onChange={(value) => setValue("patientId", value)}
                    placeholder="Selecione um paciente..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" {...register("description")} placeholder="Ex: Consulta Inicial" />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input id="amount" type="number" step="0.01" {...register("amount")} placeholder="0.00" />
                    {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Vencimento</Label>
                    <Input id="dueDate" type="date" {...register("dueDate")} />
                    {errors.dueDate && (
                        <p className="text-sm text-red-500">{errors.dueDate.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        onValueChange={(value) => setValue("status", value as "PENDING" | "PAID")}
                        defaultValue="PENDING"
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pendente</SelectItem>
                            <SelectItem value="PAID">Recebido/Pago</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Método</Label>
                    <Select onValueChange={(value) => setValue("method", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                            <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                            <SelectItem value="CASH">Dinheiro</SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="BOLETO">Boleto</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Registrar"
                    )}
                </Button>
            </div>
        </form>
    );
}
