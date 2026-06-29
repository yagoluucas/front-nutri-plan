"use client";

import React from "react";
import { IPatientData } from "../types/dietPlan.types";

interface PatientInfoSectionProps {
    data: IPatientData;
}

function formatDate(value?: string) {
    if (!value) return "Nao informado";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
        new Date(`${value}T00:00:00`)
    );
}

export default function PatientInfoSection({ data }: PatientInfoSectionProps) {
    return (
        <div className="bg-surface-default border border-border-default rounded-xl p-6 shadow-sm h-full">
            <h2 className="text-heading-h4 font-bold text-content-primary mb-1">Dados do Paciente</h2>
            <p className="text-body-small text-content-secondary mb-6">
                Para editar os dados do paciente, acesse o perfil dele.
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-body-small">
                <div className="space-y-1">
                    <dt className="font-medium text-content-secondary">Nome</dt>
                    <dd className="text-content-primary font-semibold">{data.nome || "Nao informado"}</dd>
                </div>

                <div className="space-y-1">
                    <dt className="font-medium text-content-secondary">E-mail</dt>
                    <dd className="text-content-primary truncate">{data.email || "Nao informado"}</dd>
                </div>

                <div className="space-y-1">
                    <dt className="font-medium text-content-secondary">Data de nascimento</dt>
                    <dd className="text-content-primary">{formatDate(data.dataNascimento)}</dd>
                </div>
            </dl>
        </div>
    );
}
