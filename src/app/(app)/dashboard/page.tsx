"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CircleAlert,
    CircleCheck,
    FileText,
    Plus,
    TrendingUp,
    Users,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { config } from "@/src/constants/config";
import { usePatientsQuery } from "@/src/features/patients/hooks/usePatientQueries";
import {
    getFirstPlanDeadline,
    type FirstPlanDeadlineStatus,
} from "@/src/features/patients/utils/firstPlanDeadline";

interface MetricCardProps {
    title: string;
    value: string;
    description: string;
    icon: typeof Users;
    tone?: "brand" | "info" | "warning" | "neutral";
}

const metricToneClasses = {
    brand: "bg-brand-100 text-brand-800",
    info: "bg-feedback-info-bg text-feedback-info-text",
    warning: "bg-feedback-warning-bg text-feedback-warning-text",
    neutral: "bg-surface-muted text-content-secondary",
};

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    tone = "neutral",
}: MetricCardProps) {
    return (
        <article className="rounded-lg border border-border-default bg-surface-default p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-body-small font-medium text-content-secondary">{title}</p>
                    <p className="mt-2 text-heading-h1 font-bold text-content-primary">{value}</p>
                </div>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${metricToneClasses[tone]}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-3 text-body-small text-content-muted">{description}</p>
        </article>
    );
}

function parseDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatPatientDate(value: string | Date) {
    const date = value instanceof Date ? value : parseDate(value);

    if (!date) {
        return "Data indisponivel";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getMonthStart(referenceDate: Date, offset: number) {
    return new Date(referenceDate.getFullYear(), referenceDate.getMonth() + offset, 1);
}

function getMonthEnd(referenceDate: Date) {
    return new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}`;
}

function getFirstPlanDeadlineLabel(
    status: FirstPlanDeadlineStatus,
    remainingDays: number,
) {
    if (status === "critical") {
        const delayedDays = Math.abs(remainingDays);
        return `Atrasado ha ${delayedDays} ${delayedDays === 1 ? "dia" : "dias"}`;
    }

    if (status === "nearDeadline") {
        return remainingDays === 0 ? "Entrega hoje" : `Faltam ${remainingDays} dias`;
    }

    return `Prazo ok: ${remainingDays} dias`;
}

const firstPlanDeadlineStatusClasses: Record<FirstPlanDeadlineStatus, string> = {
    critical: "bg-feedback-error-bg text-feedback-error-text",
    nearDeadline: "bg-feedback-warning-bg text-feedback-warning-text",
    onSchedule: "bg-feedback-info-bg text-feedback-info-text",
    outsideAlert: "bg-surface-muted text-content-secondary",
};

export default function DashboardPage() {
    const {
        data,
        error,
        isPending: isLoading,
        refetch,
    } = usePatientsQuery();
    const patients = useMemo(() => data ?? [], [data]);
    const errorMessage = !data && error instanceof Error
        ? error.message
        : !data && error
            ? "Nao foi possivel carregar o dashboard."
            : null;

    const dashboardData = useMemo(() => {
        const now = new Date();
        const currentMonthKey = getMonthKey(now);
        const totalPlans = patients.reduce((total, patient) => total + patient.qtdPlanos, 0);
        const patientsWithPlans = patients.filter((patient) => patient.qtdPlanos > 0).length;
        const patientsWithoutPlans = patients.length - patientsWithPlans;
        const newPatientsThisMonth = patients.filter((patient) => {
            const createdAt = parseDate(patient.createdAt);
            return createdAt ? getMonthKey(createdAt) === currentMonthKey : false;
        }).length;
        const averagePlans = patients.length > 0 ? totalPlans / patients.length : 0;
        const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
        const growthData = Array.from({ length: config.dashboard.monthsInOverview }, (_, index) => {
            const monthStart = getMonthStart(now, index - (config.dashboard.monthsInOverview - 1));
            const monthEnd = getMonthEnd(monthStart);
            const totalAtMonthEnd = patients.filter((patient) => {
                const createdAt = parseDate(patient.createdAt);
                return createdAt ? createdAt <= monthEnd : false;
            }).length;

            return {
                label: monthFormatter.format(monthStart).replace(".", ""),
                pacientes: totalAtMonthEnd,
            };
        });
        const planDistribution = [
            {
                label: "Sem plano",
                pacientes: patients.filter((patient) => patient.qtdPlanos === config.dashboard.planDistribution.noPlan).length,
            },
            {
                label: "1 plano",
                pacientes: patients.filter((patient) => patient.qtdPlanos === config.dashboard.planDistribution.onePlan).length,
            },
            {
                label: "2 planos",
                pacientes: patients.filter((patient) => patient.qtdPlanos === config.dashboard.planDistribution.twoPlans).length,
            },
            {
                label: "3 ou mais",
                pacientes: patients.filter((patient) => patient.qtdPlanos >= config.dashboard.planDistribution.threeOrMoreMinimum).length,
            },
        ];
        const recentPatients = [...patients]
            .sort((firstPatient, secondPatient) => {
                const firstDate = parseDate(firstPatient.createdAt)?.getTime() ?? 0;
                const secondDate = parseDate(secondPatient.createdAt)?.getTime() ?? 0;
                return secondDate - firstDate;
            })
            .slice(0, config.dashboard.recentPatientsLimit);
        const firstPlanDeadlines = patients.map((patient) => ({
            patient,
            deadline: getFirstPlanDeadline({
                date: patient.dataEntregaPrimeiroPlano,
                isDelivered: patient.primeiroPlanoEntregue,
            }),
        }));
        const firstPlanDeadlineDistribution = [
            {
                label: "Criticos",
                status: "critical" as const,
                fill: "var(--color-feedback-error-solid)",
            },
            {
                label: "Proximos do prazo",
                status: "nearDeadline" as const,
                fill: "var(--color-feedback-warning-solid)",
            },
            {
                label: "Dentro do prazo",
                status: "onSchedule" as const,
                fill: "var(--color-feedback-info-solid)",
            },
        ].map((group) => ({
            ...group,
            pacientes: firstPlanDeadlines.filter(
                ({ deadline }) => deadline.status === group.status,
            ).length,
        }));
        const actionableFirstPlanDeadlines = firstPlanDeadlines
            .filter(({ deadline }) => (
                deadline.status === "critical" || deadline.status === "nearDeadline"
            ))
            .sort((firstPatient, secondPatient) => (
                (firstPatient.deadline.remainingDays ?? 0) - (secondPatient.deadline.remainingDays ?? 0)
            ));

        return {
            totalPlans,
            patientsWithPlans,
            patientsWithoutPlans,
            newPatientsThisMonth,
            averagePlans,
            growthData,
            planDistribution,
            recentPatients,
            firstPlanDeadlineDistribution,
            actionableFirstPlanDeadlineCount: actionableFirstPlanDeadlines.length,
            actionableFirstPlanDeadlines: actionableFirstPlanDeadlines.slice(
                0,
                config.dashboard.firstPlanDeadlinePatientsLimit,
            ),
        };
    }, [patients]);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <p className="text-caption font-semibold uppercase text-content-secondary">Inicio</p>
                    <h1 className="text-heading-h2 font-bold text-content-primary">Dashboard</h1>
                    <p className="max-w-3xl text-body-default text-content-secondary">
                        Acompanhe o crescimento da sua base e identifique pacientes que precisam de um novo plano alimentar.
                    </p>
                </div>
            </header>

            {isLoading ? (
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Carregando indicadores...</h2>
                    <p className="mt-2 text-body-default text-content-secondary">
                        Organizando os dados dos seus pacientes e planos alimentares.
                    </p>
                </section>
            ) : errorMessage ? (
                <section className="rounded-lg border border-feedback-error-border bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Nao foi possivel carregar o dashboard</h2>
                    <p className="mt-2 text-body-default text-content-secondary">{errorMessage}</p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-action-secondary px-6 text-button font-semibold text-action-secondary-text transition-colors hover:bg-action-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus"
                    >
                        Tentar novamente
                    </button>
                </section>
            ) : patients.length === 0 ? (
                <section className="rounded-lg border border-dashed border-border-default bg-surface-default p-12 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                        <Users className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h2 className="mt-5 text-heading-h3 font-semibold text-content-primary">Seu dashboard comeca pelo primeiro paciente</h2>
                    <p className="mx-auto mt-2 max-w-xl text-body-default text-content-secondary">
                        Cadastre um paciente para acompanhar a evolucao da sua base e a criacao de planos alimentares.
                    </p>
                    <Link
                        href="/pacientes/novo"
                        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-action-primary px-6 text-button font-semibold text-action-primary-text shadow-sm transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                    >
                        <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                        Cadastrar paciente
                    </Link>
                </section>
            ) : (
                <>
                    <section aria-label="Indicadores principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            title="Total de pacientes"
                            value={patients.length.toLocaleString("pt-BR")}
                            description={`${dashboardData.newPatientsThisMonth} ${dashboardData.newPatientsThisMonth === 1 ? "novo cadastro" : "novos cadastros"} neste mes`}
                            icon={Users}
                            tone="brand"
                        />
                        <MetricCard
                            title="Planos alimentares"
                            value={dashboardData.totalPlans.toLocaleString("pt-BR")}
                            description={`${dashboardData.patientsWithPlans} ${dashboardData.patientsWithPlans === 1 ? "paciente possui" : "pacientes possuem"} ao menos um plano`}
                            icon={FileText}
                            tone="info"
                        />
                        <MetricCard
                            title="Media por paciente"
                            value={dashboardData.averagePlans.toLocaleString("pt-BR", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                            })}
                            description="Quantidade media de planos cadastrados por paciente"
                            icon={TrendingUp}
                            tone="neutral"
                        />
                        <MetricCard
                            title="Pacientes sem plano"
                            value={dashboardData.patientsWithoutPlans.toLocaleString("pt-BR")}
                            description="Cadastros que ainda precisam de um plano alimentar"
                            icon={CircleAlert}
                            tone="warning"
                        />
                    </section>

                    <section className="rounded-lg border border-border-default bg-surface-default shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border-default p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-heading-h3 font-semibold text-content-primary">Prazos do primeiro plano</h2>
                                <p className="mt-1 text-body-small text-content-secondary">
                                    Priorize entregas pendentes antes que comprometam o acompanhamento do paciente.
                                </p>
                            </div>
                            <Link
                                href="/pacientes"
                                className="inline-flex shrink-0 items-center text-button font-semibold text-action-ghost-text transition-colors hover:text-action-ghost-text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus"
                            >
                                Ver pacientes
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>

                        <div className="grid gap-6 p-5 lg:grid-cols-2">
                            <div>
                                <div
                                    className="h-64 w-full"
                                    role="img"
                                    aria-label={`Grafico de prazos do primeiro plano: ${dashboardData.firstPlanDeadlineDistribution[0].pacientes} criticos, ${dashboardData.firstPlanDeadlineDistribution[1].pacientes} proximos do prazo e ${dashboardData.firstPlanDeadlineDistribution[2].pacientes} dentro do prazo.`}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={dashboardData.firstPlanDeadlineDistribution}
                                            layout="vertical"
                                            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                                        >
                                            <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" horizontal={false} />
                                            <XAxis
                                                type="number"
                                                allowDecimals={false}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "var(--color-content-muted)", fontSize: 12 }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "var(--color-content-muted)", fontSize: 12 }}
                                                width={116}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "var(--color-background-subtle)" }}
                                                contentStyle={{
                                                    backgroundColor: "var(--color-surface-default)",
                                                    border: "1px solid var(--color-border-default)",
                                                    borderRadius: "var(--radius-md)",
                                                    boxShadow: "var(--shadow-md)",
                                                }}
                                                labelStyle={{ color: "var(--color-content-secondary)" }}
                                                itemStyle={{ color: "var(--color-content-primary)" }}
                                            />
                                            <Bar
                                                dataKey="pacientes"
                                                name="Pacientes"
                                                radius={[0, 4, 4, 0]}
                                                maxBarSize={36}
                                            >
                                                {dashboardData.firstPlanDeadlineDistribution.map((group) => (
                                                    <Cell key={group.status} fill={group.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="mt-3 text-caption text-content-muted">
                                    Critico: prazo vencido. Proximo do prazo: entre hoje e 10 dias. Dentro do prazo: entre 11 e 20 dias.
                                </p>
                            </div>

                            <div className="rounded-md bg-surface-muted p-4">
                                {dashboardData.actionableFirstPlanDeadlineCount === 0 ? (
                                    <div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-feedback-success-bg text-feedback-success-text">
                                            <CircleCheck className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <h3 className="mt-4 text-heading-h4 font-semibold text-content-primary">Nenhum primeiro plano requer atencao hoje</h3>
                                        <p className="mt-2 max-w-md text-body-small text-content-secondary">
                                            Os proximos prazos pendentes estao dentro da janela de acompanhamento.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-baseline justify-between gap-4">
                                            <div>
                                                <h3 className="text-heading-h4 font-semibold text-content-primary">Requerem atencao</h3>
                                                <p className="mt-1 text-body-small text-content-secondary">
                                                    {dashboardData.actionableFirstPlanDeadlineCount} {dashboardData.actionableFirstPlanDeadlineCount === 1 ? "paciente pendente" : "pacientes pendentes"}
                                                </p>
                                            </div>
                                            {dashboardData.actionableFirstPlanDeadlineCount > config.dashboard.firstPlanDeadlinePatientsLimit && (
                                                <span className="text-caption text-content-muted">
                                                    Exibindo {config.dashboard.firstPlanDeadlinePatientsLimit}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-4 divide-y divide-divider-default">
                                            {dashboardData.actionableFirstPlanDeadlines.map(({ patient, deadline }) => (
                                                <div key={patient.id} className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-content-primary">
                                                            {patient.nome} {patient.sobrenome}
                                                        </p>
                                                        <p className="mt-1 text-body-small text-content-secondary">
                                                            Entrega: {deadline.deadline ? formatPatientDate(deadline.deadline) : "Data indisponivel"}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-3">
                                                        <span className={`inline-flex rounded-sm px-2 py-1 text-caption font-medium ${firstPlanDeadlineStatusClasses[deadline.status]}`}>
                                                            {getFirstPlanDeadlineLabel(deadline.status, deadline.remainingDays ?? 0)}
                                                        </span>
                                                        <Link
                                                            href={`/pacientes/${patient.id}`}
                                                            className="inline-flex h-9 items-center justify-center rounded-md bg-action-ghost-bg px-3 text-button font-semibold text-action-ghost-text transition-colors hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus"
                                                        >
                                                            Abrir
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-5">
                        <article className="rounded-lg border border-border-default bg-surface-default p-5 shadow-sm xl:col-span-3">
                            <div className="mb-6">
                                <h2 className="text-heading-h3 font-semibold text-content-primary">Evolucao da base de pacientes</h2>
                                <p className="mt-1 text-body-small text-content-secondary">
                                    Total acumulado de pacientes ao final de cada mes.
                                </p>
                            </div>
                            <div className="h-80 w-full" role="img" aria-label="Grafico da evolucao da base de pacientes nos ultimos seis meses">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dashboardData.growthData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="patientGrowthFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-brand-600)" stopOpacity={0.28} />
                                                <stop offset="95%" stopColor="var(--color-brand-600)" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "var(--color-content-muted)", fontSize: 12 }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "var(--color-content-muted)", fontSize: 12 }}
                                            width={40}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "var(--color-surface-default)",
                                                border: "1px solid var(--color-border-default)",
                                                borderRadius: "var(--radius-md)",
                                                boxShadow: "var(--shadow-md)",
                                            }}
                                            labelStyle={{ color: "var(--color-content-secondary)" }}
                                            itemStyle={{ color: "var(--color-content-primary)" }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pacientes"
                                            name="Pacientes"
                                            stroke="var(--color-brand-600)"
                                            strokeWidth={3}
                                            fill="url(#patientGrowthFill)"
                                            activeDot={{ r: 5 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="rounded-lg border border-border-default bg-surface-default p-5 shadow-sm xl:col-span-2">
                            <div className="mb-6">
                                <h2 className="text-heading-h3 font-semibold text-content-primary">Distribuicao de planos</h2>
                                <p className="mt-1 text-body-small text-content-secondary">
                                    Quantos pacientes possuem nenhuma, uma ou mais versoes de plano.
                                </p>
                            </div>
                            <div className="h-80 w-full" role="img" aria-label="Grafico da distribuicao de pacientes por quantidade de planos alimentares">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.planDistribution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            tick={{ fill: "var(--color-content-muted)", fontSize: 11 }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "var(--color-content-muted)", fontSize: 12 }}
                                            width={40}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "var(--color-background-subtle)" }}
                                            contentStyle={{
                                                backgroundColor: "var(--color-surface-default)",
                                                border: "1px solid var(--color-border-default)",
                                                borderRadius: "var(--radius-md)",
                                                boxShadow: "var(--shadow-md)",
                                            }}
                                            labelStyle={{ color: "var(--color-content-secondary)" }}
                                            itemStyle={{ color: "var(--color-content-primary)" }}
                                        />
                                        <Bar
                                            dataKey="pacientes"
                                            name="Pacientes"
                                            fill="var(--color-brand-600)"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={54}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </article>
                    </section>

                    <section className="rounded-lg border border-border-default bg-surface-default shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border-default p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-heading-h3 font-semibold text-content-primary">Pacientes recentes</h2>
                                <p className="mt-1 text-body-small text-content-secondary">
                                    Ultimos cadastros adicionados a sua base.
                                </p>
                            </div>
                            <Link
                                href="/pacientes"
                                className="inline-flex items-center text-button font-semibold text-action-ghost-text transition-colors hover:text-action-ghost-text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus"
                            >
                                Ver todos
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>

                        <div className="divide-y divide-divider-default">
                            {dashboardData.recentPatients.map((patient) => (
                                <div key={patient.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-content-primary">
                                            {patient.nome} {patient.sobrenome}
                                        </p>
                                        <p className="mt-1 truncate text-body-small text-content-secondary">
                                            {patient.email || "E-mail nao informado"} · Cadastrado em {formatPatientDate(patient.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className={`inline-flex rounded-sm px-2 py-1 text-caption font-medium ${patient.qtdPlanos > 0 ? "bg-feedback-success-bg text-feedback-success-text" : "bg-feedback-warning-bg text-feedback-warning-text"}`}>
                                            {patient.qtdPlanos} {patient.qtdPlanos === 1 ? "plano" : "planos"}
                                        </span>
                                        <Link
                                            href={`/pacientes/${patient.id}`}
                                            className="inline-flex h-9 items-center justify-center rounded-md bg-action-ghost-bg px-3 text-button font-semibold text-action-ghost-text transition-colors hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-ghost-focus"
                                        >
                                            Abrir
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
