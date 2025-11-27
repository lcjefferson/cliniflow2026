"use client";

import { useState, useEffect } from "react";
interface Patient {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
}

interface Professional {
    id: string;
    name: string;
    specialty?: string | null;
}

interface Service {
    id: string;
    name: string;
    duration?: number;
    price?: number;
}

interface AppointmentBase {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    status: string;
    patientId: string;
    professionalId: string;
    serviceId: string | null;
    notes: string | null;
}
import { Calendar } from "@/components/appointments/calendar";
import { AppointmentDialog } from "@/components/appointments/appointment-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Calendar as CalendarIcon } from "lucide-react";


type AppointmentWithPatient = AppointmentBase & { patient?: Patient; professional?: Professional; service?: Service };

export default function CalendarPage() {
    const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] =
        useState<AppointmentWithPatient | undefined>();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
        null
    );

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/appointments");
            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewAppointment = (date?: Date) => {
        setSelectedAppointment(undefined);
        setSelectedDate(date);
        setDialogOpen(true);
    };

    const handleEditAppointment = (appointment: AppointmentWithPatient) => {
        setSelectedAppointment(appointment);
        setSelectedDate(undefined);
        setDialogOpen(true);
    };

    const handleCancelAppointment = (id: string) => {
        setAppointmentToCancel(id);
        setConfirmDialogOpen(true);
    };

    const confirmCancel = async () => {
        if (!appointmentToCancel) return;

        try {
            const response = await fetch(`/api/appointments/${appointmentToCancel}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchAppointments();
            }
        } catch (error) {
            console.error("Error cancelling appointment:", error);
        } finally {
            setConfirmDialogOpen(false);
            setAppointmentToCancel(null);
        }
    };

    const cancelCancellation = () => {
        setConfirmDialogOpen(false);
        setAppointmentToCancel(null);
    };

    const handleSuccess = () => {
        fetchAppointments();
    };

    const todayAppointments = appointments.filter((apt) => {
        const today = new Date();
        const aptDate = new Date(apt.startTime);
        return (
            aptDate.getDate() === today.getDate() &&
            aptDate.getMonth() === today.getMonth() &&
            aptDate.getFullYear() === today.getFullYear() &&
            apt.status !== "CANCELLED"
        );
    });

    const stats = {
        total: appointments.filter((a) => a.status !== "CANCELLED").length,
        confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
        scheduled: appointments.filter((a) => a.status === "SCHEDULED").length,
        completed: appointments.filter((a) => a.status === "COMPLETED").length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Calendário</h1>
                    <p className="text-gray-700">Gerencie todos os agendamentos</p>
                </div>
                <button
                    onClick={() => handleNewAppointment()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="h-5 w-5" />
                    Novo Agendamento
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                            <CalendarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                            <span className="text-white text-xl font-bold">
                                {stats.confirmed}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Confirmados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.confirmed}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
                            <span className="text-white text-xl font-bold">
                                {stats.scheduled}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Agendados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.scheduled}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                            <span className="text-white text-xl font-bold">
                                {stats.completed}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Concluídos</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.completed}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                    Carregando calendário...
                </div>
            ) : (
                <Calendar
                    appointments={appointments}
                    onDateClick={handleNewAppointment}
                    onEventClick={handleEditAppointment}
                />
            )}

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Agendamentos de Hoje ({todayAppointments.length})
                </h2>
                {todayAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Nenhum agendamento para hoje
                    </p>
                ) : (
                    <div className="space-y-3">
                        {todayAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer"
                                onClick={() => handleEditAppointment(apt)}
                            >
                                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-blue-50 border border-blue-100">
                                    <span className="text-xs text-blue-600">Início</span>
                                    <span className="text-lg font-bold text-blue-700">
                                        {new Date(apt.startTime).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {apt.patient?.name || "Paciente"}
                                        </h3>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${apt.status === "CONFIRMED"
                                                ? "bg-green-100 text-green-800"
                                                : apt.status === "SCHEDULED"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : apt.status === "COMPLETED"
                                                        ? "bg-gray-100 text-gray-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {apt.status === "CONFIRMED"
                                                ? "Confirmado"
                                                : apt.status === "SCHEDULED"
                                                    ? "Agendado"
                                                    : apt.status === "COMPLETED"
                                                        ? "Concluído"
                                                        : "Cancelado"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {apt.service?.name || "Serviço"} •{" "}
                                        {Math.round(
                                            (new Date(apt.endTime).getTime() -
                                                new Date(apt.startTime).getTime()) /
                                            60000
                                        )}{" "}
                                        min
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelAppointment(apt.id);
                                    }}
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Appointment Dialog */}
            <AppointmentDialog
                appointment={selectedAppointment}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={handleSuccess}
                selectedDate={selectedDate}
            />

            {/* Confirm Cancel Dialog */}
            <ConfirmDialog
                open={confirmDialogOpen}
                title="Cancelar Agendamento"
                message="Tem certeza que deseja cancelar este agendamento?"
                confirmText="Cancelar Agendamento"
                cancelText="Voltar"
                variant="danger"
                onConfirm={confirmCancel}
                onCancel={cancelCancellation}
            />
        </div>
    );
}
