"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import DietPlanForm from "@/src/features/diet-plan/components/DietPlanForm";
import { IDietPlanState, IPatientData } from "@/src/features/diet-plan/types/dietPlan.types";
import { useLocalStore } from "@/src/features/local-store/LocalStoreProvider";

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
    const { getPatientById, profile, upsertDietPlan } = useLocalStore();
    const patient = getPatientById(patientId);
    const existingPlan = patient?.planosAlimentares[0];

    const handleSavePlan = (plan: IDietPlanState) => {
        if (!patient) {
            toast.error("Paciente nao encontrado.");
            return;
        }

        upsertDietPlan(patient.id, {
            ...plan,
            id: existingPlan?.id || plan.id,
        });
        toast.success("Plano salvo nesta sessao.");
        router.push(`/pacientes/${patient.id}`);
    };

    if (!patient) {
        return (
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h1 className="text-heading-h2 font-bold text-content-primary">Paciente nao encontrado</h1>
                    <p className="mt-2 text-body-default text-content-secondary">
                        O cadastro pode ter sido perdido ao recarregar a sessao local.
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
