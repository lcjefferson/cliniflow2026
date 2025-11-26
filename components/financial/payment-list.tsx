"use client";

import { useState, useEffect } from "react";
import { Payment } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type PaymentWithPatient = Payment & {
    patient: {
        name: string;
    } | null;
};

export function PaymentList() {
    const [payments, setPayments] = useState<PaymentWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await fetch("/api/financial/payments");
            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Erro ao carregar pagamentos");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            setProcessingId(id);
            const response = await fetch(`/api/financial/payments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "PAID",
                    paidDate: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                toast.success("Pagamento marcado como recebido!");
                fetchPayments();
            } else {
                toast.error("Erro ao atualizar pagamento");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            toast.error("Erro ao atualizar pagamento");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;

        try {
            setProcessingId(id);
            const response = await fetch(`/api/financial/payments/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Pagamento excluído!");
                fetchPayments();
            } else {
                toast.error("Erro ao excluir pagamento");
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
            toast.error("Erro ao excluir pagamento");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return <Badge className="bg-green-500">Recebido</Badge>;
            case "PENDING":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
            case "OVERDUE":
                return <Badge variant="destructive">Atrasado</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">Nenhum pagamento registrado.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                                {payment.patient?.name || "Avulso"}
                            </TableCell>
                            <TableCell>{payment.description || "-"}</TableCell>
                            <TableCell>
                                {payment.dueDate
                                    ? format(new Date(payment.dueDate), "dd/MM/yyyy")
                                    : "-"}
                            </TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {payment.status !== "PAID" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMarkAsPaid(payment.id)}
                                            disabled={!!processingId}
                                            title="Marcar como recebido"
                                        >
                                            {processingId === payment.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(payment.id)}
                                        disabled={!!processingId}
                                        title="Excluir"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
