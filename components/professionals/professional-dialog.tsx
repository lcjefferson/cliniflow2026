"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfessionalForm } from "./professional-form";
import { toast } from "sonner";

interface ProfessionalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    professional?: { id: string; name: string; email?: string | null; phone?: string | null; specialty?: string | null; cro?: string | null };
    onSuccess: () => void;
}

export function ProfessionalDialog({ open, onOpenChange, professional, onSuccess }: ProfessionalDialogProps) {
    const handleSuccess = () => {
        toast.success(professional ? "Profissional atualizado com sucesso!" : "Profissional criado com sucesso!");
        onOpenChange(false);
        onSuccess();
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {professional ? "Editar Profissional" : "Novo Profissional"}
                    </DialogTitle>
                </DialogHeader>
                <ProfessionalForm
                    professional={professional ? {
                        id: professional.id,
                        name: professional.name,
                        email: professional.email || "",
                        phone: professional.phone || "",
                        specialty: professional.specialty || "",
                        cro: professional.cro || "",
                    } : undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
}
