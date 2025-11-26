"use client";

import { useState } from "react";
import { Appointment, Patient, Professional, Service } from "@prisma/client";
import { AppointmentForm } from "./appointment-form";
import { AppointmentFormData } from "@/lib/validations/appointment";
import { X } from "lucide-react";

interface AppointmentDialogProps {
    appointment?: Appointment & { patient?: Patient; professional?: Professional; service?: Service };
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
                </div>
            </div>
        </div>
    );
}
