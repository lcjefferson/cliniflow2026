import { z } from 'zod';

// User validations
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const userSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
    role: z.enum(['ADMIN', 'DENTIST', 'RECEPTIONIST', 'ASSISTANT']),
    active: z.boolean().default(true),
});

// Patient validations
export const patientSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().min(10, 'Telefone inválido'),
    cpf: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    occupation: z.string().optional(),
    maritalStatus: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    notes: z.string().optional(),
});

// Professional validations
export const professionalSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    cro: z.string().optional(),
    active: z.boolean().default(true),
});

// Service validations
export const serviceSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    price: z.number().min(0, 'Preço deve ser maior que zero'),
    duration: z.number().min(15, 'Duração mínima de 15 minutos'),
    category: z.string().optional(),
    active: z.boolean().default(true),
});

// Appointment validations
export const appointmentSchema = z.object({
    title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    patientId: z.string().min(1, 'Paciente é obrigatório'),
    professionalId: z.string().min(1, 'Profissional é obrigatório'),
    serviceId: z.string().optional(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
    notes: z.string().optional(),
});

// Lead validations
export const leadSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().min(10, 'Telefone inválido'),
    source: z.enum(['OMNICHANNEL', 'WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER']).default('OMNICHANNEL'),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).default('NEW'),
    notes: z.string().optional(),
});

// Payment validations
export const paymentSchema = z.object({
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    type: z.enum(['INCOME', 'EXPENSE']),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).default('PENDING'),
    method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER', 'CHECK']).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    paidDate: z.string().optional(),
    patientId: z.string().optional(),
    installment: z.number().optional(),
    totalInstallments: z.number().optional(),
});

// Anamnesis validations
export const anamnesisSchema = z.object({
    hasAllergies: z.boolean().default(false),
    allergiesDescription: z.string().optional(),
    hasMedications: z.boolean().default(false),
    medicationsDescription: z.string().optional(),
    hasDiseases: z.boolean().default(false),
    diseasesDescription: z.string().optional(),
    hasSurgeries: z.boolean().default(false),
    surgeriesDescription: z.string().optional(),
    smokingStatus: z.string().optional(),
    alcoholConsumption: z.string().optional(),
    dentalHistory: z.string().optional(),
    chiefComplaint: z.string().optional(),
    additionalNotes: z.string().optional(),
});

// Follow-up validations
export const followUpSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    trigger: z.enum(['BIRTHDAY', 'AFTER_APPOINTMENT', 'INACTIVE_LEAD', 'TREATMENT_END', 'CUSTOM']),
    targetType: z.enum(['PATIENTS', 'LEADS', 'BOTH']),
    delay: z.number().optional(),
    messageTemplate: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
    active: z.boolean().default(true),
});

// Clinic settings validations
export const clinicSettingsSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    cnpj: z.string().optional(),
    description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type AnamnesisInput = z.infer<typeof anamnesisSchema>;
export type FollowUpInput = z.infer<typeof followUpSchema>;
export type ClinicSettingsInput = z.infer<typeof clinicSettingsSchema>;
