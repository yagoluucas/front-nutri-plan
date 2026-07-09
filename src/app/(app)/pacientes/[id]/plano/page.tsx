"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import DietPlanForm from "@/src/features/diet-plan/components/DietPlanForm";
import { IDietPlanState, IPatientData } from "@/src/features/diet-plan/types/dietPlan.types";
import { saveDietPlanApi } from "@/src/features/diet-plan/services/dietPlan.service";
import { getPatientApi } from "@/src/features/patients/services/patient.service";
import { useProfile } from "@/src/features/profile/ProfileProvider";
import type { Patient } from "@/src/features/patients/types/patient.types";

function mapPatientToDietPlanPatient(patient: {
    nome: string;
    sobrenome: string;
    email?: string;
    dataNascimento?: string;
}): Partial<IPatientData> {
    return {
        nome: `${patient.nome} ${patient.sobrenome}`,
        email: patient.email || "",
        dataNascimento: patient.dataNascimento || "",
    };
}

export default function PacientePlanoPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = typeof params.id === "string" ? params.id : "";
    const searchParams = useSearchParams();
    const planId = searchParams.get("planId");
    const { profile } = useProfile();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const existingPlan = planId ? patient?.planosAlimentares.find(p => p.id === planId) : undefined;

    const handleSavePlan = async (plan: IDietPlanState) => {
        if (!patient) {
            toast.error("Paciente nao encontrado.");
            return;
        }

        await saveDietPlanApi(patient.id, {
            ...plan,
            id: existingPlan?.id || plan.id,
        });
        toast.success("Plano salvo com sucesso.");
        router.push(`/pacientes/${patient.id}`);
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
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h1 className="text-heading-h2 font-bold text-content-primary">Paciente nao encontrado</h1>
                    <p className="mt-2 text-body-default text-content-secondary">
                        {errorMessage || "Nao encontramos este cadastro no banco de dados."}
                    </p>
                    <Button type="button" variant="primary" className="mt-6" onClick={() => router.push("/pacientes")}>
                        Ver pacientes
                    </Button>
                </section>
            </div>
        );
    }

    return (
        <DietPlanForm
            initialPlan={existingPlan}
            initialPatient={mapPatientToDietPlanPatient(patient)}
            profile={profile}
            backHref={`/pacientes/${patient.id}`}
            onSavePlan={handleSavePlan}
        />
    );
}
