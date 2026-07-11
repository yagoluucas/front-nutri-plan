"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import DietPlanForm from "@/src/features/diet-plan/components/DietPlanForm";
import { IDietPlanState, IPatientData } from "@/src/features/diet-plan/types/dietPlan.types";
import { saveDietPlanApi } from "@/src/features/diet-plan/services/dietPlan.service";
import { usePatientQuery } from "@/src/features/patients/hooks/usePatientQueries";
import { useProfile } from "@/src/features/profile/ProfileProvider";
import { queryKeys } from "@/src/lib/queryKeys";

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
    const queryClient = useQueryClient();
    const patientId = typeof params.id === "string" ? params.id : "";
    const searchParams = useSearchParams();
    const planId = searchParams.get("planId");
    const { profile } = useProfile();
    const {
        data: patient,
        error,
        isPending: isLoading,
    } = usePatientQuery(patientId);
    const errorMessage = !patient && error instanceof Error
        ? error.message
        : !patient && error
            ? "Nao foi possivel buscar o paciente."
            : null;
    const existingPlan = planId ? patient?.planosAlimentares.find(p => p.id === planId) : undefined;

    const handleSavePlan = async (plan: IDietPlanState) => {
        if (!patient) {
            toast.error("Paciente nao encontrado.");
            return;
        }

        if (planId && !existingPlan) {
            toast.error("Plano alimentar nao encontrado para edicao.");
            return;
        }

        const planToSave = existingPlan
            ? { ...plan, id: existingPlan.id }
            : { ...plan, id: undefined };

        await saveDietPlanApi(patient.id, planToSave);
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: queryKeys.patients.detail(patient.id),
            }),
            queryClient.invalidateQueries({ queryKey: queryKeys.patients.list }),
        ]);
        toast.success("Plano salvo com sucesso.");
        router.push(`/pacientes/${patient.id}`);
    };

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

    if (planId && !existingPlan) {
        return (
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h1 className="text-heading-h2 font-bold text-content-primary">Plano alimentar nao encontrado</h1>
                    <p className="mt-2 text-body-default text-content-secondary">
                        O identificador do plano informado na URL nao corresponde a um plano salvo para este paciente.
                    </p>
                    <Button type="button" variant="primary" className="mt-6" onClick={() => router.push(`/pacientes/${patient.id}`)}>
                        Voltar para o paciente
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
