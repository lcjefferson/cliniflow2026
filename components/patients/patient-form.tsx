"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, PatientFormData } from "@/lib/validations/patient";
import { Patient } from "@prisma/client";

interface PatientFormProps {
    patient?: Patient;
    onSubmit: (data: PatientFormData) => Promise<void>;
    onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        defaultValues: patient
            ? {
                ...patient,
                birthDate: patient.birthDate
                    ? new Date(patient.birthDate).toISOString().split("T")[0]
                    : "",
                email: patient.email || "",
                cpf: patient.cpf || "",
                gender: patient.gender || "",
                address: patient.address || "",
                city: patient.city || "",
                state: patient.state || "",
                zipCode: patient.zipCode || "",
                occupation: patient.occupation || "",
                maritalStatus: patient.maritalStatus || "",
                emergencyContact: patient.emergencyContact || "",
                emergencyPhone: patient.emergencyPhone || "",
                notes: patient.notes || "",
            }
            : undefined,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                    </label>
                    <input
                        {...register("name")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome do paciente"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        {...register("email")}
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@exemplo.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                    </label>
                    <input
                        {...register("phone")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 98765-4321"
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                </div>

                {/* CPF */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF
                    </label>
                    <input
                        {...register("cpf")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123.456.789-00"
                    />
                </div>

                {/* Birth Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Nascimento
                    </label>
                    <input
                        {...register("birthDate")}
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gênero
                    </label>
                    <select
                        {...register("gender")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>

                {/* Marital Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Civil
                    </label>
                    <select
                        {...register("maritalStatus")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Selecione</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                </div>

                {/* Occupation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profissão
                    </label>
                    <input
                        {...register("occupation")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Profissão"
                    />
                </div>

                {/* Address */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                    </label>
                    <input
                        {...register("address")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Rua, número, complemento"
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                    </label>
                    <input
                        {...register("city")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Cidade"
                    />
                </div>

                {/* State */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                    </label>
                    <input
                        {...register("state")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="UF"
                        maxLength={2}
                    />
                </div>

                {/* ZIP Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                    </label>
                    <input
                        {...register("zipCode")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345-678"
                    />
                </div>

                {/* Emergency Contact */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contato de Emergência
                    </label>
                    <input
                        {...register("emergencyContact")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome do contato"
                    />
                </div>

                {/* Emergency Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone de Emergência
                    </label>
                    <input
                        {...register("emergencyPhone")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 98765-4321"
                    />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações
                    </label>
                    <textarea
                        {...register("notes")}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Observações adicionais sobre o paciente"
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
                    {isSubmitting ? "Salvando..." : patient ? "Atualizar" : "Criar"}
                </button>
            </div>
        </form>
    );
}
