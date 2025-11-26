"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialData {
    received: number;
    pending: number;
    overdue: number;
}

export function FinancialStats() {
    const [data, setData] = useState<FinancialData>({ received: 0, pending: 0, overdue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/financial/dashboard");
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching financial stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ ...</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recebido (Mês)</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(data.received)}</div>
                    <p className="text-xs text-muted-foreground">
                        Total recebido no mês atual
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">A Receber (Mês)</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{formatCurrency(data.pending)}</div>
                    <p className="text-xs text-muted-foreground">
                        Vencendo este mês
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(data.overdue)}</div>
                    <p className="text-xs text-muted-foreground">
                        Pagamentos vencidos
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
