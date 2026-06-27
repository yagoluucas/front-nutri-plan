"use client";

import React from "react";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import { IPatientData } from "../types/dietPlan.types";

interface PatientInfoSectionProps {
    data: IPatientData;
    onChange: (field: keyof IPatientData, value: string) => void;
}

export default function PatientInfoSection({ data, onChange }: PatientInfoSectionProps) {
    return (
        <div className="bg-surface-default border border-border-default rounded-xl p-6 shadow-sm">
            <h2 className="text-heading-h4 font-bold text-content-primary mb-6">Dados do Paciente</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="paciente_nome">Nome Completo</Label>
                    <Input
                        id="paciente_nome"
                        type="text"
                        placeholder="Ex: João da Silva"
                        value={data.nome}
                        onChange={(e) => onChange("nome", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="paciente_email">E-mail</Label>
                    <Input
                        id="paciente_email"
                        type="email"
                        placeholder="joao@email.com"
                        value={data.email}
                        onChange={(e) => onChange("email", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="paciente_sexo">Sexo</Label>
                    <div className="relative">
                        <select
                            id="paciente_sexo"
                            className="w-full h-11 rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm appearance-none"
                            value={data.sexo}
                            onChange={(e) => onChange("sexo", e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-content-secondary">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor="paciente_objetivo">Objetivo do Plano</Label>
                    <Input
                        id="paciente_objetivo"
                        type="text"
                        placeholder="Ex: Hipertrofia, Emagrecimento, Reeducação Alimentar..."
                        value={data.objetivo}
                        onChange={(e) => onChange("objetivo", e.target.value)}
                    />
                </div>

                <div className="space-y-2 lg:col-span-3">
                    <Label htmlFor="paciente_observacoes">Observações Gerais</Label>
                    <textarea
                        id="paciente_observacoes"
                        rows={3}
                        className="w-full rounded-lg border border-border-default bg-surface-default p-4 text-body-default text-content-primary placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus shadow-sm transition-all resize-none"
                        placeholder="Alergias, aversões ou comentários importantes..."
                        value={data.observacoes}
                        onChange={(e) => onChange("observacoes", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
