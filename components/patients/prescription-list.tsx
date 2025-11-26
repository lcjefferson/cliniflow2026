"use client";

import { useState, useEffect, useCallback } from "react";
import { Prescription } from "@prisma/client";
import { Plus, FileText, Loader2, Trash2, Printer } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generatePrescriptionHTML } from "@/lib/print-utils";

const prescriptionSchema = z.object({
    medications: z.array(z.object({
        name: z.string().min(1, "Nome do medicamento é obrigatório"),
        dosage: z.string().min(1, "Dosagem é obrigatória"),
        instructions: z.string().min(1, "Instruções são obrigatórias"),
    })).min(1, "Adicione pelo menos um medicamento"),
    notes: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionListProps {
    patientId: string;
    patientName: string;
}

type PrescriptionWithDetails = Prescription & {
    professional: {
        name: string;
        cro: string | null;
    };
};

export function PrescriptionList({ patientId, patientName }: PrescriptionListProps) {
    const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PrescriptionFormData>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            medications: [{ name: "", dosage: "", instructions: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medications",
    });

    const [clinicName, setClinicName] = useState("Dental Clinic");

    const fetchPrescriptions = useCallback(async () => {
        try {
            const response = await fetch(`/api/patients/${patientId}/prescriptions`);
            if (response.ok) {
                const data = await response.json();
                setPrescriptions(data);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    const fetchClinicSettings = async () => {
        try {
            const response = await fetch("/api/settings/clinic");
            if (response.ok) {
                const data = await response.json();
                if (data.name) {
                    setClinicName(data.name);
                }
            }
        } catch (error) {
            console.error("Error fetching clinic settings:", error);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
        fetchClinicSettings();
    }, [fetchPrescriptions]);

    const onSubmit = async (data: PrescriptionFormData) => {
        try {
            setSaving(true);
            const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await fetchPrescriptions();
                setIsCreating(false);
                reset();
            }
        } catch (error) {
            console.error("Error creating prescription:", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = (prescription: PrescriptionWithDetails) => {
        try {
            const medications = JSON.parse(prescription.medications);
            const html = generatePrescriptionHTML(
                clinicName,
                patientName,
                medications,
                prescription.notes || undefined,
                prescription.professional.name,
                prescription.professional.cro || undefined,
                new Date(prescription.createdAt).toLocaleDateString("pt-BR")
            );

            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
            }
        } catch (error) {
            console.error("Error generating print:", error);
            alert("Erro ao gerar impressão. Tente novamente.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!isCreating ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Receitas Emitidas</h3>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            Nova Receita
                        </button>
                    </div>

                    {prescriptions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhuma receita encontrada.</p>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((prescription) => (
                                <div
                                    key={prescription.id}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(prescription.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Dr(a). {prescription.professional.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePrint(prescription)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Imprimir PDF"
                                    >
                                        <Printer className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Nova Receita</h3>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 bg-gray-50 rounded-lg space-y-4 relative">
                                    <div className="flex justify-between">
                                        <h4 className="text-sm font-medium text-gray-700">Medicamento {index + 1}</h4>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                {...register(`medications.${index}.name`)}
                                                placeholder="Nome do Medicamento"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {errors.medications?.[index]?.name && (
                                                <p className="text-red-500 text-xs mt-1">{errors.medications[index]?.name?.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                {...register(`medications.${index}.dosage`)}
                                                placeholder="Dosagem (ex: 500mg)"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {errors.medications?.[index]?.dosage && (
                                                <p className="text-red-500 text-xs mt-1">{errors.medications[index]?.dosage?.message}</p>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                {...register(`medications.${index}.instructions`)}
                                                placeholder="Instruções de uso (ex: Tomar 1 comprimido a cada 8 horas)"
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            {errors.medications?.[index]?.instructions && (
                                                <p className="text-red-500 text-xs mt-1">{errors.medications[index]?.instructions?.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => append({ name: "", dosage: "", instructions: "" })}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar Medicamento
                        </button>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                            <textarea
                                {...register("notes")}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Observações adicionais..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                                Salvar Receita
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
