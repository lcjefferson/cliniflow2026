import { Metadata } from "next";
import { FinancialStats } from "@/components/financial/financial-stats";
import { PaymentList } from "@/components/financial/payment-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PaymentDialog } from "@/components/financial/payment-dialog";

export const metadata: Metadata = {
    title: "Financeiro | Dental Clinic",
    description: "Gestão financeira da clínica",
};

export default function FinancialPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted-foreground">
                        Acompanhe o fluxo de caixa e pagamentos.
                    </p>
                </div>
                <PaymentDialog>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Pagamento
                    </Button>
                </PaymentDialog>
            </div>

            <FinancialStats />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Pagamentos</h2>
                <PaymentList />
            </div>
        </div>
    );
}
