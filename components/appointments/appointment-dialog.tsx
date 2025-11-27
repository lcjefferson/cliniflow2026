"use client";

import { useState } from "react";
interface AppointmentBase {
    id: string;
    patientId: string;
    professionalId: string;
    serviceId: string | null;
    startTime: string | Date;
    endTime: string | Date;
    notes: string | null;
    status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | string;
}

type AppointmentWithDetails = AppointmentBase & {
    patient?: {
        id: string;
        name: string;
        phone?: string | null;
        email?: string | null;
    };
    professional?: {
        id: string;
        name: string;
        specialty?: string | null;
    };
    service?: {
        id: string;
        name: string;
        duration?: number;
        price?: number;
    };
};
import { AppointmentForm } from "./appointment-form";
import { AppointmentFormData } from "@/lib/validations/appointment";
import { X } from "lucide-react";

interface AppointmentDialogProps {
    appointment?: AppointmentWithDetails;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDate?: Date;
}

export function AppointmentDialog({
    appointment,
    open,
    onClose,
    onSuccess,
    selectedDate,
}: AppointmentDialogProps) {
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (data: AppointmentFormData) => {
        try {
            setError("");
            const url = appointment
                ? `/api/appointments/${appointment.id}`
                : "/api/appointments";
            const method = appointment ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    setError("Conflito de horário detectado. Escolha outro horário.");
                } else {
                    setError(result.error || "Erro ao salvar agendamento.");
                }
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError("Erro ao salvar agendamento. Tente novamente.");
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!appointment) return;
        const confirmed = window.confirm("Tem certeza que deseja excluir este agendamento?");
        if (!confirmed) return;
        try {
            setDeleting(true);
            const response = await fetch(`/api/appointments/${appointment.id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const result = await response.json();
                setError(result.error || "Erro ao excluir agendamento.");
                return;
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Erro ao excluir agendamento. Tente novamente.");
        } finally {
            setDeleting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {appointment ? "Editar Agendamento" : "Novo Agendamento"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    <AppointmentForm
                        appointment={appointment}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        selectedDate={selectedDate}
                    />
                    {appointment && (
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            >
                                {deleting ? "Excluindo..." : "Excluir Agendamento"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
