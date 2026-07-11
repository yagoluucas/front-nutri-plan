"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import PatientForm from "@/src/features/patients/components/PatientForm";
import { PatientFormValues } from "@/src/features/patients/schemas/patient.schemas";
import { createPatientApi } from "@/src/features/patients/services/patient.service";
import { queryKeys } from "@/src/lib/queryKeys";

export default function NovoPacientePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: PatientFormValues) => {
        try {
            setIsSubmitting(true);
            const patient = await createPatientApi(values);
            queryClient.setQueryData(queryKeys.patients.detail(patient.id), patient);
            await queryClient.invalidateQueries({ queryKey: queryKeys.patients.list });

            toast.success("Paciente cadastrado com sucesso.");
            router.push(`/pacientes/${patient.id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Nao foi possivel cadastrar o paciente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
            <header className="space-y-4">
                <Button type="button" variant="ghost" className="px-0" onClick={() => router.push("/pacientes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="space-y-2">
                    <p className="text-caption font-semibold uppercase text-content-secondary">Pacientes</p>
                    <h1 className="text-heading-h2 font-bold text-content-primary">Novo paciente</h1>
                    <p className="max-w-3xl text-body-default text-content-secondary">
                        Cadastre os dados essenciais para iniciar o acompanhamento nutricional.
                    </p>
                </div>
            </header>

            <PatientForm
                isSubmitting={isSubmitting}
                submitLabel="Salvar paciente"
                onCancel={() => router.push("/pacientes")}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
