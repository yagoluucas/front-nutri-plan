"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileDown,
  Pencil,
  Trash2,
  UtensilsCrossed,
  UserPen,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import { useLocalStore } from "@/src/features/local-store/LocalStoreProvider";
import PDFGenerator from "@/src/features/diet-plan/components/PDFGenerator";
import { calculatePlanMicronutrients } from "@/src/features/diet-plan/utils/nutritionCalculations";
import { getPatientApi } from "@/src/features/patients/services/patient.service";
import type { Patient } from "@/src/features/patients/types/patient.types";

function formatDate(value?: string) {
  if (!value) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNutrientValue(value: number, unit: string) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: value >= 10 ? 1 : 2,
  }).format(value);

  return `${formattedValue}${unit}`;
}

export default function PacienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = typeof params.id === "string" ? params.id : "";
  const { profile } = useLocalStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const handleDeletePlan = (planId: string) => {
    setPatient((currentPatient) =>
      currentPatient
        ? {
            ...currentPatient,
            planosAlimentares: currentPatient.planosAlimentares.filter(
              (plan) => plan.id !== planId,
            ),
          }
        : currentPatient,
    );
    toast.success("Plano removido da visualizacao atual.");
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
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Nao foi possivel buscar o paciente.",
          );
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
        <Button
          type="button"
          variant="ghost"
          className="px-0"
          onClick={() => router.push("/pacientes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
          <h1 className="text-heading-h2 font-bold text-content-primary">
            Carregando paciente...
          </h1>
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
        <Button
          type="button"
          variant="ghost"
          className="px-0"
          onClick={() => router.push("/pacientes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
          <h1 className="text-heading-h2 font-bold text-content-primary">
            Paciente nao encontrado
          </h1>
          <p className="mt-2 text-body-default text-content-secondary">
            {errorMessage || "Nao encontramos este cadastro no banco de dados."}
          </p>
          <Link
            href="/pacientes"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-action-primary px-6 text-button font-semibold text-action-primary-text shadow-sm transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
          >
            Ver pacientes
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
      <header className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          className="px-0"
          onClick={() => router.push("/pacientes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="space-y-2">
          <p className="text-caption font-semibold uppercase text-content-secondary">
            Paciente
          </p>
          <h1 className="text-heading-h2 font-bold text-content-primary">
            {patient.nome} {patient.sobrenome}
          </h1>
          <div className="flex flex-wrap gap-3 text-body-small text-content-secondary">
            <span>{patient.email || "E-mail nao informado"}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(patient.dataNascimento)}
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-heading-h4 font-semibold text-content-primary">
              Dados do paciente
            </h2>
            <Link
              href={`/pacientes/${patient.id}/editar`}
              className="inline-flex h-9 items-center justify-center rounded-md bg-action-secondary px-4 text-caption font-semibold text-action-secondary-text shadow-sm transition-colors hover:bg-action-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus"
            >
              <UserPen className="mr-2 h-4 w-4" />
              Editar dados
            </Link>
          </div>
          <dl className="mt-5 grid gap-4 text-body-small md:grid-cols-2 xl:grid-cols-3">
            <div>
              <dt className="font-medium text-content-secondary">Nome</dt>
              <dd className="mt-1 text-content-primary">
                {patient.nome} {patient.sobrenome}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-content-secondary">E-mail</dt>
              <dd className="mt-1 text-content-primary">
                {patient.email || "Nao informado"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-content-secondary">Nascimento</dt>
              <dd className="mt-1 text-content-primary">
                {formatDate(patient.dataNascimento)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-content-secondary">Sexo</dt>
              <dd className="mt-1 text-content-primary">
                {patient.sexo || "Nao informado"}
              </dd>
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <dt className="font-medium text-content-secondary">
                Observacoes
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-content-primary">
                {patient.observacoes || "Sem observacoes."}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-default p-4 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-heading-h3 font-semibold text-content-primary">
                Planos alimentares
              </h2>
              <p className="mt-1 text-body-small text-content-secondary">
                {patient.planosAlimentares.length}{" "}
                {patient.planosAlimentares.length === 1
                  ? "plano vinculado"
                  : "planos vinculados"}
              </p>
            </div>
          </div>

          {patient.planosAlimentares.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-default bg-background-subtle p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-action-primary">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-heading-h4 font-semibold text-content-primary">
                Nenhum plano alimentar
              </h3>
              <p className="mt-2 text-body-small text-content-secondary">
                Crie um plano para liberar as opcoes de refeicao e o PDF.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {patient.planosAlimentares.map((plan) => {
                const isExpanded = expandedPlanId === plan.id;
                const micronutrients = calculatePlanMicronutrients(
                  plan.refeicoes,
                );

                return (
                  <article
                    key={plan.id}
                    className="rounded-lg border border-border-default bg-surface-default p-5 shadow-sm"
                  >
                    <div>
                      <div>
                        <h3 className="text-heading-h4 font-semibold text-content-primary">
                          {plan.titulo || "Plano alimentar"}
                        </h3>
                        <p className="mt-1 text-body-small text-content-secondary">
                          {plan.refeicoes.length}{" "}
                          {plan.refeicoes.length === 1
                            ? "refeicao"
                            : "refeicoes"}{" "}
                          cadastradas
                        </p>
                        <p className="mt-1 text-caption text-content-muted">
                          Atualizado em {formatDateTime(plan.updatedAt)}
                        </p>
                      </div>

                      <div className="grid grid-flow-col gap-2 auto-cols-[1fr] mt-3.5">
                        <Button
                          type="button"
                          variant="details"
                          onClick={() =>
                            setExpandedPlanId(isExpanded ? null : plan.id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="mr-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="mr-2 h-4 w-4" />
                          )}
                          Ver detalhes
                        </Button>
                        <PDFGenerator
                          data={plan}
                          profile={profile}
                          disabled={plan.refeicoes.length === 0}
                          label="Baixar Plano"
                          buttonClassName="px-4"
                        />
                        <Link
                          href={`/pacientes/${patient.id}/plano`}
                          className="inline-flex h-11 items-center justify-center rounded-md bg-action-secondary px-4 text-button font-semibold text-action-secondary-text shadow-sm transition-colors hover:bg-action-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modificar
                        </Link>
                        <Button
                          type="button"
                          variant="destructive"
                          className="px-4"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 space-y-5 border-t border-border-subtle pt-5">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div className="rounded-md border border-border-default bg-background-subtle p-3">
                            <p className="text-caption font-medium text-content-secondary">
                              Kcal
                            </p>
                            <p className="mt-1 text-heading-h4 font-semibold text-content-primary">
                              {plan.totalMacros.kcal.toFixed(0)}
                            </p>
                          </div>
                          <div className="rounded-md border border-border-default bg-background-subtle p-3">
                            <p className="text-caption font-medium text-content-secondary">
                              Carboidratos
                            </p>
                            <p className="mt-1 text-heading-h4 font-semibold text-content-primary">
                              {plan.totalMacros.cho.toFixed(1)}g
                            </p>
                          </div>
                          <div className="rounded-md border border-border-default bg-background-subtle p-3">
                            <p className="text-caption font-medium text-content-secondary">
                              Proteinas
                            </p>
                            <p className="mt-1 text-heading-h4 font-semibold text-content-primary">
                              {plan.totalMacros.ptn.toFixed(1)}g
                            </p>
                          </div>
                          <div className="rounded-md border border-border-default bg-background-subtle p-3">
                            <p className="text-caption font-medium text-content-secondary">
                              Gorduras
                            </p>
                            <p className="mt-1 text-heading-h4 font-semibold text-content-primary">
                              {plan.totalMacros.lip.toFixed(1)}g
                            </p>
                          </div>
                        </div>

                        <section>
                          <div className="mb-3">
                            <h4 className="text-heading-h4 font-semibold text-content-primary">
                              Micronutrientes do plano
                            </h4>
                            <p className="mt-1 text-body-small text-content-secondary">
                              Soma dos alimentos da opcao principal de todas as
                              refeicoes.
                            </p>
                          </div>

                          {micronutrients.length === 0 ? (
                            <div className="rounded-md border border-dashed border-border-default bg-background-subtle p-6 text-center">
                              <p className="text-body-small text-content-secondary">
                                Nenhum micronutriente calculado para este plano.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                              {micronutrients.map((nutrient) => (
                                <div
                                  key={`${nutrient.nomeComponente}-${nutrient.unidadeUtilizada}`}
                                  className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-background-subtle px-3 py-2 text-body-small"
                                >
                                  <span
                                    className="truncate text-content-secondary"
                                    title={nutrient.nomeComponente}
                                  >
                                    {nutrient.nomeComponente}
                                  </span>
                                  <span className="shrink-0 font-semibold text-content-primary">
                                    {formatNutrientValue(
                                      nutrient.valorCalculado,
                                      nutrient.unidadeUtilizada,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-feedback-info-border bg-feedback-info-bg p-5 text-feedback-info-text">
          <div className="flex gap-3">
            <FileDown className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-body-small">
              O PDF usa os dados atuais do perfil profissional e do plano
              alimentar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
