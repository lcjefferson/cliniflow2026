import { z } from "zod";

export const patientSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
    cpf: z.string().optional().or(z.literal("")),
    birthDate: z.string().optional().or(z.literal("")),
    gender: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    zipCode: z.string().optional().or(z.literal("")),
    occupation: z.string().optional().or(z.literal("")),
    maritalStatus: z.string().optional().or(z.literal("")),
    emergencyContact: z.string().optional().or(z.literal("")),
    emergencyPhone: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
});

export type PatientFormData = z.infer<typeof patientSchema>;
