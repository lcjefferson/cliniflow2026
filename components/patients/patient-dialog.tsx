"use client";

import { useState } from "react";
import { Patient } from "@prisma/client";
import { PatientForm } from "./patient-form";
import { PatientFormData } from "@/lib/validations/patient";
import { X } from "lucide-react";

interface PatientDialogProps {
    patient?: Patient;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PatientDialog({
    patient,
    open,
    onClose,
    onSuccess,
}: PatientDialogProps) {
    const [error, setError] = useState("");

    const handleSubmit = async (data: PatientFormData) => {
        try {
            setError("");
            const url = patient
                ? `/api/patients/${patient.id}`
                : "/api/patients";
            const method = patient ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to save patient");
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError("Erro ao salvar paciente. Tente novamente.");
            console.error(err);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {patient ? "Editar Paciente" : "Novo Paciente"}
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
                    <PatientForm
                        patient={patient}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
