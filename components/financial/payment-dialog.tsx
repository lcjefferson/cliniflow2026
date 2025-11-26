"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentForm } from "./payment-form";

interface PaymentDialogProps {
    children: React.ReactNode;
}

export function PaymentDialog({ children }: PaymentDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Pagamento</DialogTitle>
                    <DialogDescription>
                        Registre um novo pagamento ou despesa.
                    </DialogDescription>
                </DialogHeader>
                <PaymentForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
