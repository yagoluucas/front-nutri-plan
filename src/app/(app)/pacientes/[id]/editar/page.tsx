"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import PatientForm from "@/src/features/patients/components/PatientForm";
import { PatientFormValues } from "@/src/features/patients/schemas/patient.schemas";
import { getPatientApi, updatePatientApi } from "@/src/features/patients/services/patient.service";
import type { Patient } from "@/src/features/patients/types/patient.types";

export default function EditarPacientePage() {
    const params = useParams();
    const router = useRouter();
    const patientId = typeof params.id === "string" ? params.id : "";
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (values: PatientFormValues) => {
        try {
            setIsSubmitting(true);
            await updatePatientApi(patientId, values);
            toast.success("Dados do paciente atualizados.");
            router.push(`/pacientes/${patientId}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Nao foi possivel atualizar o paciente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let isActive = true;

        async function loadPatient() {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const loadedPatient = await getPatientApi(patientId);

                if (isActive) {
                    setPatient(loadedPatient);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel buscar o paciente.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        if (patientId) {
            loadPatient();
        }

        return () => {
            isActive = false;
        };
    }, [patientId]);

    if (isLoading) {
        return (
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
                <Button type="button" variant="ghost" className="px-0" onClick={() => router.push("/pacientes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h1 className="text-heading-h2 font-bold text-content-primary">Carregando paciente...</h1>
                    <p className="mt-2 text-body-default text-content-secondary">
                        Buscando os dados salvos no banco.
                    </p>
                </section>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
                <Button type="button" variant="ghost" className="px-0" onClick={() => router.push("/pacientes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h1 className="text-heading-h2 font-bold text-content-primary">Paciente nao encontrado</h1>
                    <p className="mt-2 text-body-default text-content-secondary">
                        {errorMessage || "Nao encontramos este cadastro no banco de dados."}
                    </p>
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
            <header className="space-y-4">
                <Button type="button" variant="ghost" className="px-0" onClick={() => router.push(`/pacientes/${patientId}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="space-y-2">
                    <p className="text-caption font-semibold uppercase text-content-secondary">Pacientes</p>
                    <h1 className="text-heading-h2 font-bold text-content-primary">Editar paciente</h1>
                    <p className="max-w-3xl text-body-default text-content-secondary">
                        Atualize os dados cadastrais de{" "}
                        <span className="font-semibold text-content-primary">
                            {patient.nome} {patient.sobrenome}
                        </span>
                        .
                    </p>
                </div>
            </header>

            <PatientForm
                defaultValues={{
                    nome: patient.nome,
                    sobrenome: patient.sobrenome,
                    email: patient.email || "",
                    dataNascimento: patient.dataNascimento || "",
                    sexo: patient.sexo,
                    observacoes: patient.observacoes || "",
                }}
                isSubmitting={isSubmitting}
                submitLabel="Salvar alteracoes"
                onCancel={() => router.push(`/pacientes/${patientId}`)}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
