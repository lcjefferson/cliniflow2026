"use client";

import { useState, useEffect } from "react";
import { Patient } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnamnesisForm } from "@/components/patients/anamnesis-form";
import { PrescriptionList } from "@/components/patients/prescription-list";
import { CertificateList } from "@/components/patients/certificate-list";
import { Loader2, FileText, Pill, FileCheck } from "lucide-react";
import { useParams } from "next/navigation";

export default function PatientDetailsPage() {
    const params = useParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.id) {
            fetchPatient(params.id as string);
        }
    }, [params?.id]);

    const fetchPatient = async (id: string) => {
        try {
            const response = await fetch(`/api/patients/${id}`);
            if (response.ok) {
                const data = await response.json();
                setPatient(data);
            }
        } catch (error) {
            console.error("Error fetching patient:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Paciente não encontrado</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {patient.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span>{patient.phone}</span>
                            <span>•</span>
                            <span>{patient.email || "Sem email"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="anamnesis" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl border border-gray-100 mb-6">
                    <TabsTrigger value="anamnesis" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Anamnese
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Receitas
                    </TabsTrigger>
                    <TabsTrigger value="certificates" className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4" />
                        Atestados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="anamnesis">
                    <AnamnesisForm patientId={patient.id} />
                </TabsContent>

                <TabsContent value="prescriptions">
                    <PrescriptionList patientId={patient.id} patientName={patient.name} />
                </TabsContent>

                <TabsContent value="certificates">
                    <CertificateList patientId={patient.id} patientName={patient.name} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
