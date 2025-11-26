import { z } from "zod";

export const appointmentSchema = z.object({
    patientId: z.string().min(1, "Paciente é obrigatório"),
    professionalId: z.string().min(1, "Profissional é obrigatório"),
    serviceId: z.string().optional().or(z.literal("")),
    startTime: z.string().min(1, "Horário de início é obrigatório"),
    endTime: z.string().min(1, "Horário de término é obrigatório"),
    notes: z.string().optional().or(z.literal("")),
    status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
}).refine((data) => {
    // Validate that endTime is after startTime
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
}, {
    message: "Horário de término deve ser posterior ao horário de início",
    path: ["endTime"],
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

