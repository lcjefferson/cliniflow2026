"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
interface Patient {
    id: string;
    name: string;
}

interface Professional {
    id: string;
    name: string;
}

interface Service {
    id: string;
    name: string;
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
import { useRef } from "react";

interface CalendarProps {
    appointments: (AppointmentBase & { patient?: Patient; professional?: Professional; service?: Service })[];
    onDateClick: (date: Date) => void;
    onEventClick: (
        appointment: AppointmentBase & { patient?: Patient; professional?: Professional; service?: Service }
    ) => void;
}

export function Calendar({
    appointments,
    onDateClick,
    onEventClick,
}: CalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);

    const events = appointments.map((apt) => ({
        id: apt.id,
        title: `${apt.service?.name || "Serviço"} - ${apt.patient?.name || "Paciente"}`,
        start: apt.startTime,
        end: apt.endTime,
        backgroundColor: getStatusColor(apt.status),
        borderColor: getStatusColor(apt.status),
        extendedProps: {
            appointment: apt,
        },
    }));

    function getStatusColor(status: string) {
        switch (status) {
            case "SCHEDULED":
                return "#3b82f6"; // blue
            case "CONFIRMED":
                return "#10b981"; // green
            case "COMPLETED":
                return "#6b7280"; // gray
            case "CANCELLED":
                return "#ef4444"; // red
            default:
                return "#3b82f6";
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                locale="pt-br"
                buttonText={{
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                }}
                timeZone="local"
                slotMinTime="07:00:00"
                slotMaxTime="23:59:59"
                allDaySlot={false}
                weekends={true}
                events={events}
                dateClick={(info) => {
                    onDateClick(info.date);
                }}
                eventClick={(info) => {
                    const appointment = info.event.extendedProps.appointment;
                    onEventClick(appointment);
                }}
                height="auto"
                eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
            />
        </div>
    );
}
