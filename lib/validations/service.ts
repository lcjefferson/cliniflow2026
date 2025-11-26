import { z } from "zod";

export const serviceSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional().or(z.literal("")),
    price: z.string().min(1, "Preço é obrigatório"),
    duration: z.string().min(1, "Duração é obrigatória"),
    category: z.string().optional().or(z.literal("")),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
