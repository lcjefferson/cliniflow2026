import { z } from "zod";

export const professionalSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    specialty: z.string().optional().or(z.literal("")),
    cro: z.string().optional().or(z.literal("")),
});

export type ProfessionalFormData = z.infer<typeof professionalSchema>;
