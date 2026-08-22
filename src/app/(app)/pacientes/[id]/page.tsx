"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileDown,
  Pencil,
  Trash2,
  UtensilsCrossed,
  UserPen,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import PDFGenerator from "@/src/features/diet-plan/components/PDFGenerator";
import { deleteDietPlanApi } from "@/src/features/diet-plan/services/dietPlan.service";
import { calculatePlanMicronutrients } from "@/src/features/diet-plan/utils/nutritionCalculations";
import { usePatientQuery } from "@/src/features/patients/hooks/usePatientQueries";
import {
  deletePatientApi,
  updateFirstPlanDeliveryStatusApi,
} from "@/src/features/patients/services/patient.service";
import { useProfile } from "@/src/features/profile/ProfileProvider";
import { queryKeys } from "@/src/lib/queryKeys";

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

function getSortableDate(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
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
  const queryClient = useQueryClient();
  const patientId = typeof params.id === "string" ? params.id : "";
  const { profile } = useProfile();
  const {
    data: patient,
    error,
    isPending: isLoading,
  } = usePatientQuery(patientId);
  const errorMessage =
    !patient && error instanceof Error
      ? error.message
      : !patient && error
        ? "Nao foi possivel buscar o paciente."
        : null;
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [planIdPendingDeletion, setPlanIdPendingDeletion] = useState<string | null>(null);
  const [showDeletePatientConfirm, setShowDeletePatientConfirm] = useState(false);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);
  const [isUpdatingFirstPlanDelivery, setIsUpdatingFirstPlanDelivery] = useState(false);
  const visiblePlans = useMemo(
    () => patient?.planosAlimentares ?? [],
    [patient?.planosAlimentares],
  );
  const sortedVisiblePlans = useMemo(
    () =>
      [...visiblePlans].sort((firstPlan, secondPlan) => {
        if (firstPlan.planoAtivo !== secondPlan.planoAtivo) {
          return firstPlan.planoAtivo ? -1 : 1;
        }

        return getSortableDate(secondPlan.createdAt) - getSortableDate(firstPlan.createdAt);
      }),
    [visiblePlans],
  );
  const isDeletingPlan = deletingPlanId !== null;

  const handleUpdateFirstPlanDelivery = async (primeiroPlanoEntregue: boolean) => {
    if (!patient || isUpdatingFirstPlanDelivery) {
      return;
    }

    const previousPatient = patient;
    setIsUpdatingFirstPlanDelivery(true);
    queryClient.setQueryData(queryKeys.patients.detail(patient.id), {
      ...patient,
      primeiroPlanoEntregue,
    });

    try {
      const updatedPatient = await updateFirstPlanDeliveryStatusApi(
        patient.id,
        primeiroPlanoEntregue,
      );
      queryClient.setQueryData(queryKeys.patients.detail(patient.id), updatedPatient);
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.list });
      toast.success(
        primeiroPlanoEntregue
          ? "Entrega do primeiro plano confirmada."
          : "Entrega do primeiro plano marcada como pendente.",
      );
    } catch (error) {
      queryClient.setQueryData(queryKeys.patients.detail(patient.id), previousPatient);
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o status do primeiro plano.",
      );
    } finally {
      setIsUpdatingFirstPlanDelivery(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!patient || deletingPlanId) {
      return;
    }

    setDeletingPlanId(planId);

    try {
      await deleteDietPlanApi(patient.id, planId);
      setPlanIdPendingDeletion(null);
      setExpandedPlanId((currentId) => (currentId === planId ? null : currentId));
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.patients.detail(patient.id),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.patients.list }),
      ]);
      toast.success("Plano alimentar excluido com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o plano alimentar.",
      );
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDeletePatient = async () => {
    if (!patient || isDeletingPatient) {
      return;
    }

    setIsDeletingPatient(true);

    try {
      const message = await deletePatientApi(patient.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.patients.list });
      queryClient.removeQueries({ queryKey: queryKeys.patients.detail(patient.id) });
      toast.success(message);
      setShowDeletePatientConfirm(false);
      router.replace("/pacientes");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir o paciente.",
      );
    } finally {
      setIsDeletingPatient(false);
    }
  };

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
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/pacientes/${patient.id}/editar`}
                className="inline-flex h-11 items-center justify-center rounded-md bg-action-secondary px-6 text-button font-semibold text-action-secondary-text shadow-sm transition-colors hover:bg-action-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus"
              >
                <UserPen className="mr-2 h-4 w-4" />
                Editar dados
              </Link>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeletePatientConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir paciente
              </Button>
            </div>
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

        <section
          className={`rounded-lg border p-5 ${patient.primeiroPlanoEntregue
            ? "border-feedback-success-border bg-feedback-success-bg text-feedback-success-text"
            : "border-feedback-info-border bg-feedback-info-bg text-feedback-info-text"
            }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="text-heading-h4 font-semibold">
                  {patient.primeiroPlanoEntregue
                    ? "Primeiro plano entregue"
                    : "Primeiro plano pendente"}
                </h2>
                <p className="mt-1 text-body-small">
                  {patient.primeiroPlanoEntregue
                    ? "Desative o controle se precisar voltar a receber os alertas de prazo na lista de pacientes."
                    : "Ative o controle apos entregar o plano alimentar para interromper os alertas de prazo na lista de pacientes."}
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-body-small font-medium">
              <span>{patient.primeiroPlanoEntregue ? "Entregue" : "Nao entregue"}</span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  role="switch"
                  aria-label="Primeiro plano entregue"
                  checked={patient.primeiroPlanoEntregue}
                  onChange={(event) => void handleUpdateFirstPlanDelivery(event.target.checked)}
                  disabled={isUpdatingFirstPlanDelivery}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="h-full w-full rounded-full border border-feedback-info-border bg-surface-default transition-colors peer-checked:border-feedback-success-solid peer-checked:bg-feedback-success-solid peer-focus-visible:ring-2 peer-focus-visible:ring-action-primary-focus peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-feedback-info-solid shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:bg-surface-default"
                />
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-default p-4 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-heading-h3 font-semibold text-content-primary">
                Planos alimentares
              </h2>
              <p className="mt-1 text-body-small text-content-secondary">
                {visiblePlans.length}{" "}
                {visiblePlans.length === 1
                  ? "plano vinculado"
                  : "planos vinculados"}
              </p>
            </div>
          </div>

          {visiblePlans.length === 0 ? (
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

              <Button
                className="mt-5"
                type="button"
                variant="primary"
                onClick={() => router.push(`/pacientes/${patient.id}/plano`)}
              >
                <Plus className="mr-2" />
                Criar Plano Alimentar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedVisiblePlans.map((plan) => {
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
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-heading-h4 font-semibold text-content-primary">
                            {plan.tituloPlano || "Plano alimentar"}
                          </h3>
                          {plan.planoAtivo && (
                            <span className="inline-flex items-center gap-1 rounded-sm bg-feedback-success-bg px-2 py-1 text-caption font-medium text-feedback-success-text">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Ativo
                            </span>
                          )}
                        </div>
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

                      <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-flow-col sm:auto-cols-[1fr] sm:grid-cols-none sm:gap-1">
                        <Button
                          type="button"
                          variant="details"
                          className="order-last w-full sm:order-0"
                          disabled={isDeletingPlan}
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
                          disabled={isDeletingPlan || plan.refeicoes.length === 0}
                          label="Baixar Plano"
                          buttonClassName="w-full px-4"
                        />
                        <Link
                          href={`/pacientes/${patient.id}/plano?planId=${plan.id}`}
                          aria-disabled={isDeletingPlan}
                          tabIndex={isDeletingPlan ? -1 : 0}
                          onClick={(event) => {
                            if (isDeletingPlan) {
                              event.preventDefault();
                            }
                          }}
                          className={`inline-flex h-11 w-full items-center justify-center rounded-md bg-action-secondary px-4 text-button font-semibold text-action-secondary-text shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus ${isDeletingPlan ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-action-secondary-hover"}`}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Modificar
                        </Link>
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-full px-4"
                          disabled={isDeletingPlan}
                          onClick={() => setPlanIdPendingDeletion(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingPlanId === plan.id ? "Excluindo..." : "Excluir"}
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

              <Button
                className="mt-5"
                type="button"
                variant="primary"
                disabled={isDeletingPlan}
                onClick={() => router.push(`/pacientes/${patient.id}/plano`)}
              >
                <Plus className="mr-2" />
                Novo Plano Alimentar
              </Button>
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

      {planIdPendingDeletion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isDeletingPlan) {
              setPlanIdPendingDeletion(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-plan-title"
            aria-describedby="delete-plan-description"
            className="w-full max-w-md rounded-lg border border-border-default bg-surface-default p-6 shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-feedback-error-bg text-feedback-error-text">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="delete-plan-title"
                    className="text-heading-h3 font-semibold text-content-primary"
                  >
                    Deseja mesmo excluir o plano alimentar?
                  </h2>
                  <p
                    id="delete-plan-description"
                    className="mt-2 text-body-small text-content-secondary"
                  >
                    Depois de excluído, este plano não ficará mais disponível. Esta ação não poderá ser desfeita.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-content-secondary transition-colors hover:bg-surface-muted hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus disabled:cursor-not-allowed disabled:text-content-disabled"
                onClick={() => setPlanIdPendingDeletion(null)}
                aria-label="Fechar confirmação de exclusão do plano alimentar"
                disabled={isDeletingPlan}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPlanIdPendingDeletion(null)}
                disabled={isDeletingPlan}
                autoFocus
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeletePlan(planIdPendingDeletion)}
                disabled={isDeletingPlan}
              >
                {isDeletingPlan ? "Excluindo..." : "Sim, excluir plano"}
              </Button>
            </div>
          </section>
        </div>
      )}

      {showDeletePatientConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isDeletingPatient) {
              setShowDeletePatientConfirm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-patient-title"
            aria-describedby="delete-patient-description"
            className="w-full max-w-md rounded-lg border border-border-default bg-surface-default p-6 shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-feedback-error-bg text-feedback-error-text">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="delete-patient-title"
                    className="text-heading-h3 font-semibold text-content-primary"
                  >
                    Deseja mesmo excluir o paciente?
                  </h2>
                  <p
                    id="delete-patient-description"
                    className="mt-2 text-body-small text-content-secondary"
                  >
                    O cadastro de {patient.nome} {patient.sobrenome} sera excluido permanentemente. Esta acao nao pode ser desfeita.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-content-secondary transition-colors hover:bg-surface-muted hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus disabled:cursor-not-allowed disabled:text-content-disabled"
                onClick={() => setShowDeletePatientConfirm(false)}
                aria-label="Fechar confirmacao de exclusao"
                disabled={isDeletingPatient}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeletePatientConfirm(false)}
                disabled={isDeletingPatient}
                autoFocus
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeletePatient()}
                disabled={isDeletingPatient}
              >
                {isDeletingPatient ? "Excluindo..." : "Sim, excluir paciente"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
