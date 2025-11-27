"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Loader2, Printer } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateCertificateHTML } from "@/lib/print-utils";

const certificateSchema = z.object({
    description: z.string().min(1, "Motivo é obrigatório"),
    days: z.string().min(1, "Quantidade de dias é obrigatória"),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    notes: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface CertificateListProps {
    patientId: string;
    patientName: string;
}

interface CertificateBase {
    id: string;
    description: string;
    startDate: string | Date;
    days: number;
    notes: string | null;
    createdAt: string | Date;
}

type CertificateWithDetails = CertificateBase & {
    professional: {
        name: string;
        cro: string | null;
    };
};

export function CertificateList({ patientId, patientName }: CertificateListProps) {
    const [certificates, setCertificates] = useState<CertificateWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CertificateFormData>({
        resolver: zodResolver(certificateSchema),
        defaultValues: {
            startDate: new Date().toISOString().slice(0, 10),
        },
    });

    const [clinicName, setClinicName] = useState("Dental Clinic");

    const fetchCertificates = useCallback(async () => {
        try {
            const response = await fetch(`/api/patients/${patientId}/certificates`);
            if (response.ok) {
                const data = await response.json();
                setCertificates(data);
            }
        } catch (error) {
            console.error("Error fetching certificates:", error);
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
        fetchCertificates();
        fetchClinicSettings();
    }, [fetchCertificates]);

    const onSubmit = async (data: CertificateFormData) => {
        try {
            setSaving(true);
            const response = await fetch(`/api/patients/${patientId}/certificates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await fetchCertificates();
                setIsCreating(false);
                reset();
            }
        } catch (error) {
            console.error("Error creating certificate:", error);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = (certificate: CertificateWithDetails) => {
        try {
            const html = generateCertificateHTML(
                clinicName,
                patientName,
                certificate.description,
                certificate.days,
                new Date(certificate.startDate).toLocaleDateString("pt-BR"),
                certificate.notes || undefined,
                certificate.professional.name,
                certificate.professional.cro || undefined,
                new Date(certificate.createdAt).toLocaleDateString("pt-BR")
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
                        <h3 className="text-lg font-semibold text-gray-900">Atestados Emitidos</h3>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            Novo Atestado
                        </button>
                    </div>

                    {certificates.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Nenhum atestado encontrado.</p>
                    ) : (
                        <div className="space-y-4">
                            {certificates.map((certificate) => (
                                <div
                                    key={certificate.id}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {certificate.days} dias - {new Date(certificate.startDate).toLocaleDateString("pt-BR")}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Dr(a). {certificate.professional.name}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePrint(certificate)}
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
                        <h3 className="text-lg font-semibold text-gray-900">Novo Atestado</h3>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo do Afastamento</label>
                                <input
                                    {...register("description")}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ex: Tratamento odontológico de urgência"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Afastamento</label>
                                <input
                                    type="number"
                                    {...register("days")}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ex: 1"
                                />
                                {errors.days && (
                                    <p className="text-red-500 text-xs mt-1">{errors.days.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
                                <input
                                    type="date"
                                    {...register("startDate")}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.startDate && (
                                    <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                                <textarea
                                    {...register("notes")}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Observações adicionais..."
                                />
                            </div>
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
                                Salvar Atestado
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
