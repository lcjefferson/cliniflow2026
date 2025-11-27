"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";

const anamnesisSchema = z.object({
    hasAllergies: z.boolean(),
    allergiesDescription: z.string().optional(),
    hasMedications: z.boolean(),
    medicationsDescription: z.string().optional(),
    hasDiseases: z.boolean(),
    diseasesDescription: z.string().optional(),
    hasSurgeries: z.boolean(),
    surgeriesDescription: z.string().optional(),
    smokingStatus: z.string().optional(),
    alcoholConsumption: z.string().optional(),
    dentalHistory: z.string().optional(),
    chiefComplaint: z.string().optional(),
    additionalNotes: z.string().optional(),
});

type AnamnesisFormData = z.infer<typeof anamnesisSchema>;

interface AnamnesisFormProps {
    patientId: string;
}

export function AnamnesisForm({ patientId }: AnamnesisFormProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        reset,
    } = useForm<AnamnesisFormData>({
        resolver: zodResolver(anamnesisSchema),
        defaultValues: {
            hasAllergies: false,
            hasMedications: false,
            hasDiseases: false,
            hasSurgeries: false,
        },
    });

    const hasAllergies = watch("hasAllergies");
    const hasMedications = watch("hasMedications");
    const hasDiseases = watch("hasDiseases");
    const hasSurgeries = watch("hasSurgeries");

    const fetchAnamnesis = useCallback(async () => {
        try {
            const response = await fetch(`/api/patients/${patientId}/anamnesis`);
            if (response.ok) {
                const data = await response.json();
                if (data && Object.keys(data).length > 0) {
                    reset(data);
                }
            }
        } catch (error) {
            console.error("Error fetching anamnesis:", error);
        } finally {
            setLoading(false);
        }
    }, [patientId, reset]);

    useEffect(() => {
        fetchAnamnesis();
    }, [fetchAnamnesis]);

    const onSubmit = async (data: AnamnesisFormData) => {
        try {
            setSaving(true);
            setSuccessMessage("");
            const response = await fetch(`/api/patients/${patientId}/anamnesis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to save");

            setSuccessMessage("Anamnese salva com sucesso!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error saving anamnesis:", error);
        } finally {
            setSaving(false);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Histórico Médico</h3>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Allergies */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasAllergies"
                                {...register("hasAllergies")}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="hasAllergies" className="text-sm font-medium text-gray-700">
                                Possui Alergias?
                            </label>
                        </div>
                        {hasAllergies && (
                            <textarea
                                {...register("allergiesDescription")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Descreva as alergias..."
                                rows={3}
                            />
                        )}
                    </div>

                    {/* Medications */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasMedications"
                                {...register("hasMedications")}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="hasMedications" className="text-sm font-medium text-gray-700">
                                Uso Contínuo de Medicamentos?
                            </label>
                        </div>
                        {hasMedications && (
                            <textarea
                                {...register("medicationsDescription")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Quais medicamentos..."
                                rows={3}
                            />
                        )}
                    </div>

                    {/* Diseases */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasDiseases"
                                {...register("hasDiseases")}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="hasDiseases" className="text-sm font-medium text-gray-700">
                                Doenças Pré-existentes?
                            </label>
                        </div>
                        {hasDiseases && (
                            <textarea
                                {...register("diseasesDescription")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Diabetes, Hipertensão, etc..."
                                rows={3}
                            />
                        )}
                    </div>

                    {/* Surgeries */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasSurgeries"
                                {...register("hasSurgeries")}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="hasSurgeries" className="text-sm font-medium text-gray-700">
                                Cirurgias Recentes?
                            </label>
                        </div>
                        {hasSurgeries && (
                            <textarea
                                {...register("surgeriesDescription")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Quais cirurgias e quando..."
                                rows={3}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Hábitos e Histórico</h3>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tabagismo</label>
                        <select
                            {...register("smokingStatus")}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecione...</option>
                            <option value="NEVER">Nunca fumou</option>
                            <option value="FORMER">Ex-fumante</option>
                            <option value="CURRENT">Fumante atual</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consumo de Álcool</label>
                        <select
                            {...register("alcoholConsumption")}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecione...</option>
                            <option value="NEVER">Nunca</option>
                            <option value="OCCASIONAL">Ocasionalmente</option>
                            <option value="FREQUENT">Frequentemente</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Queixa Principal</label>
                        <textarea
                            {...register("chiefComplaint")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Motivo da consulta..."
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Histórico Odontológico</label>
                        <textarea
                            {...register("dentalHistory")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Tratamentos anteriores, experiências..."
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observações Adicionais</label>
                        <textarea
                            {...register("additionalNotes")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                {successMessage && (
                    <span className="text-green-600 text-sm font-medium animate-fade-in">
                        {successMessage}
                    </span>
                )}
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Salvar Anamnese
                </button>
            </div>
        </form>
    );
}
