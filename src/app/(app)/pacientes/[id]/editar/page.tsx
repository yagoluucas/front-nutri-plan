"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import { useLocalStore } from "@/src/features/local-store/LocalStoreProvider";
import PatientForm from "@/src/features/patients/components/PatientForm";
import { PatientFormValues } from "@/src/features/patients/schemas/patient.schemas";

export default function EditarPacientePage() {
    const params = useParams();
    const router = useRouter();
    const patientId = typeof params.id === "string" ? params.id : "";
    const { getPatientById, updatePatient } = useLocalStore();
    const patient = getPatientById(patientId);

    const handleSubmit = (values: PatientFormValues) => {
        updatePatient(patientId, values);
        toast.success("Dados do paciente atualizados.");
        router.push(`/pacientes/${patientId}`);
    };

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
                        O cadastro pode ter sido perdido ao recarregar a sessao local.
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
                submitLabel="Salvar alteracoes"
                onCancel={() => router.push(`/pacientes/${patientId}`)}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
