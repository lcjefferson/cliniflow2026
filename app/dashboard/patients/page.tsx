"use client";

import { useState, useEffect } from "react";
import { Patient } from "@prisma/client";
import { PatientDialog } from "@/components/patients/patient-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Search, Plus, Phone, Mail, Edit, Trash2 } from "lucide-react";

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const url = searchTerm
                ? `/api/patients?search=${encodeURIComponent(searchTerm)}`
                : "/api/patients";
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [searchTerm]);

    const handleNewPatient = () => {
        setSelectedPatient(undefined);
        setDialogOpen(true);
    };

    const handleEditPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setDialogOpen(true);
    };

    const handleDeletePatient = (id: string) => {
        setPatientToDelete(id);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!patientToDelete) return;

        try {
            const response = await fetch(`/api/patients/${patientToDelete}`, {
                method: "DELETE",
            });
            if (response.ok) {
                fetchPatients();
            }
        } catch (error) {
            console.error("Error deleting patient:", error);
        } finally {
            setConfirmDialogOpen(false);
            setPatientToDelete(null);
        }
    };

    const cancelDelete = () => {
        setConfirmDialogOpen(false);
        setPatientToDelete(null);
    };

    const handleSuccess = () => {
        fetchPatients();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Pacientes</h1>
                    <p className="text-gray-700">Gerencie todos os pacientes da clínica</p>
                </div>
                <button
                    onClick={handleNewPatient}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="h-5 w-5" />
                    Novo Paciente
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                            <span className="text-white text-xl font-bold">{patients.length}</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                            <span className="text-white text-xl font-bold">
                                {patients.filter((p) => p.active).length}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Ativos</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {patients.filter((p) => p.active).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                            <span className="text-white text-xl font-bold">
                                {patients.filter((p) => p.email).length}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Com Email</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {patients.filter((p) => p.email).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                            <span className="text-white text-xl font-bold">
                                {patients.filter((p) => p.birthDate).length}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-700">Com Aniversário</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {patients.filter((p) => p.birthDate).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone ou email..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Lista de Pacientes</h2>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Carregando...</div>
                    ) : patients.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Nenhum paciente encontrado
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Nome
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Contato
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        CPF
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Cidade
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                                                    <span className="text-sm font-semibold text-white">
                                                        {patient.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <a href={`/dashboard/patients/${patient.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                                                    {patient.name}
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Phone className="h-3 w-3" />
                                                    {patient.phone}
                                                </div>
                                                {patient.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Mail className="h-3 w-3" />
                                                        {patient.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {patient.cpf || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {patient.city || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patient.active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {patient.active ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditPatient(patient)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePatient(patient.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Patient Dialog */}
            <PatientDialog
                patient={selectedPatient}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={handleSuccess}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={confirmDialogOpen}
                title="Excluir Paciente"
                message="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}
