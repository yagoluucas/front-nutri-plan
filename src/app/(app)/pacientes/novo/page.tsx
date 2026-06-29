"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import { useLocalStore } from "@/src/features/local-store/LocalStoreProvider";
import PatientForm from "@/src/features/patients/components/PatientForm";
import { PatientFormValues } from "@/src/features/patients/schemas/patient.schemas";

export default function NovoPacientePage() {
    const router = useRouter();
    const { createPatient } = useLocalStore();

    const handleSubmit = (values: PatientFormValues) => {
        const patient = createPatient(values);
        toast.success("Paciente cadastrado nesta sessao.");
        router.push(`/pacientes/${patient.id}`);
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
                submitLabel="Salvar paciente"
                onCancel={() => router.push("/pacientes")}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

