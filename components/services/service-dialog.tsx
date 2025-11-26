"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";
import { toast } from "sonner";

interface ServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service?: { id: string; name: string; description?: string | null; price: number; duration: number; category?: string | null };
    onSuccess: () => void;
}

export function ServiceDialog({ open, onOpenChange, service, onSuccess }: ServiceDialogProps) {
    const handleSuccess = () => {
        toast.success(service ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!");
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
                        {service ? "Editar Serviço" : "Novo Serviço"}
                    </DialogTitle>
                </DialogHeader>
                <ServiceForm
                    service={service ? {
                        id: service.id,
                        name: service.name,
                        description: service.description || "",
                        price: service.price.toString(),
                        duration: service.duration.toString(),
                        category: service.category || "",
                    } : undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
}
