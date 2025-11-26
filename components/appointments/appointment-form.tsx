"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    appointmentSchema,
    AppointmentFormData,
} from "@/lib/validations/appointment";
import { Appointment, Patient, Professional, Service } from "@prisma/client";
import { useEffect, useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { Plus } from "lucide-react";

interface AppointmentFormProps {
    appointment?: Appointment & { patient?: Patient; professional?: Professional; service?: Service };
    onSubmit: (data: AppointmentFormData) => Promise<void>;
    onCancel: () => void;
    selectedDate?: Date;
}

export function AppointmentForm({
    appointment,
    onSubmit,
    onCancel,
    selectedDate,
}: AppointmentFormProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [patientDialogOpen, setPatientDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientsRes, professionalsRes, servicesRes] = await Promise.all([
                fetch("/api/patients"),
                fetch("/api/professionals"),
                fetch("/api/services"),
            ]);

            if (patientsRes.ok) {
                const data = await patientsRes.json();
                setPatients(data);
            }
            if (professionalsRes.ok) {
                const data = await professionalsRes.json();
                setProfessionals(data);
            }
            if (servicesRes.ok) {
                const data = await servicesRes.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSuccess = async () => {
        // Refresh patients list
        const response = await fetch("/api/patients");
        if (response.ok) {
            const data = await response.json();
            setPatients(data);
            // Optionally select the newest patient here if we could identify them
        }
    };

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: appointment
            ? {
                patientId: appointment.patientId,
                professionalId: appointment.professionalId,
                serviceId: appointment.serviceId || "",
                startTime: new Date(new Date(appointment.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                endTime: new Date(new Date(appointment.endTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                notes: appointment.notes || "",
                status: appointment.status as "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
            }
            : selectedDate
                ? {
                    startTime: new Date(selectedDate.setHours(9, 0, 0, 0)).toISOString().slice(0, 16),
                    endTime: new Date(selectedDate.setHours(10, 0, 0, 0)).toISOString().slice(0, 16),
                }
                : {
                    startTime: "",
                    endTime: "",
                },
    });

    const selectedPatientId = watch("patientId");
    const selectedProfessionalId = watch("professionalId");
    const selectedServiceId = watch("serviceId");

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {/* Patient Selection */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Paciente *
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                {loading ? (
                                    <div className="text-gray-500 text-sm">Carregando pacientes...</div>
                                ) : (
                                    <SearchableSelect
                                        options={patients.map((p) => ({
                                            label: p.name,
                                            value: p.id,
                                            description: p.phone,
                                        }))}
                                        value={selectedPatientId}
                                        onChange={(value) => setValue("patientId", value, { shouldValidate: true })}
                                        placeholder="Selecione um paciente"
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setPatientDialogOpen(true)}
                                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-200"
                                title="Novo Paciente"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        {errors.patientId && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.patientId.message}
                            </p>
                        )}
                    </div>

                    {/* Professional Selection */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profissional *
                        </label>
                        {loading ? (
                            <div className="text-gray-500 text-sm">Carregando profissionais...</div>
                        ) : (
                            <SearchableSelect
                                options={professionals.map((p) => ({
                                    label: p.name,
                                    value: p.id,
                                    description: p.specialty || undefined,
                                }))}
                                value={selectedProfessionalId}
                                onChange={(value) => setValue("professionalId", value, { shouldValidate: true })}
                                placeholder="Selecione um profissional"
                            />
                        )}
                        {errors.professionalId && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.professionalId.message}
                            </p>
                        )}
                    </div>

                    {/* Service Selection */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Serviço
                        </label>
                        {loading ? (
                            <div className="text-gray-500 text-sm">Carregando serviços...</div>
                        ) : (
                            <SearchableSelect
                                options={services.map((s) => ({
                                    label: s.name,
                                    value: s.id,
                                    description: `${s.duration} min - R$ ${s.price.toFixed(2)}`,
                                }))}
                                value={selectedServiceId || ""}
                                onChange={(value) => setValue("serviceId", value)}
                                placeholder="Selecione um serviço"
                            />
                        )}
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horário de Início *
                        </label>
                        <input
                            {...register("startTime")}
                            type="datetime-local"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.startTime && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.startTime.message}
                            </p>
                        )}
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horário de Término *
                        </label>
                        <input
                            {...register("endTime")}
                            type="datetime-local"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.endTime && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.endTime.message}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    {appointment && (
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                {...register("status")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="SCHEDULED">Agendado</option>
                                <option value="CONFIRMED">Confirmado</option>
                                <option value="COMPLETED">Concluído</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea
                            {...register("notes")}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Observações sobre o agendamento"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting
                            ? "Salvando..."
                            : appointment
                                ? "Atualizar"
                                : "Agendar"}
                    </button>
                </div>
            </form>

            <PatientDialog
                open={patientDialogOpen}
                onClose={() => setPatientDialogOpen(false)}
                onSuccess={handlePatientSuccess}
            />
        </>
    );
}
