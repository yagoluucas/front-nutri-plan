"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText, Plus, Search, Users } from "lucide-react";
import Input from "@/src/components/ui/Input";
import { listPatientsApi } from "@/src/features/patients/services/patient.service";
import type { PatientSummary } from "@/src/features/patients/types/patient.types";

function formatUpdatedAt(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function PacientesPage() {
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const filteredPatients = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return patients;
        }

        return patients.filter((patient) => [
            patient.nome,
            patient.sobrenome,
            `${patient.nome} ${patient.sobrenome}`,
            patient.email,
        ].some((value) => value?.toLowerCase().includes(normalizedSearch)));
    }, [patients, searchTerm]);

    useEffect(() => {
        let isActive = true;

        async function loadPatients() {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const loadedPatients = await listPatientsApi();

                if (isActive) {
                    setPatients(loadedPatients);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel buscar os pacientes.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadPatients();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <p className="text-caption font-semibold uppercase text-content-secondary">Pacientes</p>
                    <h1 className="text-heading-h2 font-bold text-content-primary">Meus pacientes</h1>
                    <p className="max-w-3xl text-body-default text-content-secondary">
                        Acompanhe pacientes, planos alimentares e dados essenciais em uma unica rotina.
                    </p>
                </div>

                {patients.length > 0 && (
                    <Link href="/pacientes/novo" className="inline-flex h-11 items-center justify-center rounded-md bg-action-primary px-6 text-button font-semibold text-action-primary-text shadow-sm transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus">
                        <Plus className="mr-2 h-5 w-5" />
                        Novo paciente
                    </Link>
                )}
            </header>

            <section className="rounded-lg border border-border-default bg-surface-default p-4 shadow-sm">
                <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-content-placeholder" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome ou email"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-10"
                    />
                </div>
            </section>

            {isLoading ? (
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Carregando pacientes...</h2>
                    <p className="mt-2 text-body-default text-content-secondary">
                        Buscando os cadastros salvos no banco de dados.
                    </p>
                </section>
            ) : errorMessage ? (
                <section className="rounded-lg border border-feedback-error-border bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Nao foi possivel carregar</h2>
                    <p className="mt-2 text-body-default text-content-secondary">{errorMessage}</p>
                </section>
            ) : patients.length === 0 ? (
                <section className="rounded-lg border border-dashed border-border-default bg-surface-default p-12 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-action-primary">
                        <Users className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-heading-h3 font-semibold text-content-primary">Nenhum paciente cadastrado</h2>
                    <p className="mx-auto mt-2 max-w-xl text-body-default text-content-secondary">
                        Comece cadastrando um paciente para criar o primeiro plano alimentar.
                    </p>
                    <Link href="/pacientes/novo" className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-action-primary px-6 text-button font-semibold text-action-primary-text shadow-sm transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus">
                        <Plus className="mr-2 h-5 w-5" />
                        Novo paciente
                    </Link>
                </section>
            ) : filteredPatients.length === 0 ? (
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Nenhum resultado encontrado</h2>
                    <p className="mt-2 text-body-default text-content-secondary">
                        Revise o termo de busca e tente novamente.
                    </p>
                </section>
            ) : (
                <section className="overflow-hidden rounded-lg border border-border-default bg-surface-default shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 text-left text-body-small">
                            <thead className="bg-surface-muted text-content-secondary">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Paciente</th>
                                    <th className="px-4 py-3 font-medium">Nascimento</th>
                                    <th className="px-4 py-3 font-medium">Planos</th>
                                    <th className="px-4 py-3 font-medium">Atualizado</th>
                                    <th className="px-4 py-3 text-right font-medium">Acoes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-divider-default text-content-primary">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-content-primary">{patient.nome} {patient.sobrenome}</div>
                                            <div className="mt-1 text-content-secondary">
                                                {patient.email || "E-mail nao informado"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-2 text-content-secondary">
                                                <CalendarDays className="h-4 w-4" />
                                                Nao informado
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center rounded-sm bg-feedback-info-bg px-2 py-1 text-caption font-medium text-feedback-info-text">
                                                {patient.qtdPlanos} {patient.qtdPlanos === 1 ? "plano" : "planos"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-content-secondary">
                                            {formatUpdatedAt(patient.updatedAt)}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link href={`/pacientes/${patient.id}`} className="inline-flex items-center justify-center rounded-md bg-action-ghost-bg px-3 py-2 text-button font-semibold text-action-ghost-text transition-colors hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Abrir
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
