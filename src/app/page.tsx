import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileDown,
  FileText,
  Leaf,
  Search,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import PublicFooter from "@/src/features/marketing/components/PublicFooter";
import PublicHeader from "@/src/features/marketing/components/PublicHeader";
import ProductPreview from "@/src/features/marketing/components/ProductPreview";
import FaqSection from "@/src/features/marketing/components/FaqSection";

export const metadata: Metadata = {
  title: "Planos alimentares e gestao de pacientes",
  description:
    "Crie planos alimentares, organize pacientes e gere documentos profissionais com uma plataforma gratuita para nutricionistas.",
  openGraph: {
    title: "Nutri Plan - Planos alimentares e gestao de pacientes",
    description:
      "Uma ferramenta gratuita e simples para nutricionistas criarem planos alimentares e organizarem seus pacientes.",
  },
};

const differentials = [
  { icon: Leaf, label: "Acesso gratuito" },
  { icon: Users, label: "Gestao de pacientes" },
  { icon: UtensilsCrossed, label: "Planos alimentares" },
  { icon: FileDown, label: "Documentos em PDF" },
];

const resources = [
  {
    icon: Users,
    title: "Pacientes em um unico lugar",
    description: "Consulte os dados cadastrais e os planos vinculados a cada acompanhamento.",
  },
  {
    icon: UtensilsCrossed,
    title: "Refeicoes e opcoes bem organizadas",
    description: "Estruture horarios, alimentos e alternativas conforme sua conduta.",
  },
  {
    icon: Search,
    title: "Busca de alimentos",
    description: "Encontre alimentos e medidas para compor as refeicoes do plano.",
  },
  {
    icon: BarChart3,
    title: "Informacoes nutricionais",
    description: "Visualize macronutrientes e micronutrientes enquanto monta o plano.",
  },
  {
    icon: FileText,
    title: "PDF pronto para compartilhar",
    description: "Gere uma versao organizada do plano alimentar para o paciente.",
  },
  {
    icon: BarChart3,
    title: "Visao da sua base",
    description: "Acompanhe pacientes e planos no dashboard da plataforma.",
  },
];

function PrimaryLink({
  children,
  className = "",
  inverted = false,
}: {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/login"
      className={`inline-flex h-11 items-center justify-center rounded-md px-5 text-button font-semibold shadow-sm transition-[background-color,transform,box-shadow] hover:shadow-md active:translate-y-px focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none ${
        inverted
          ? "bg-surface-default text-action-primary hover:bg-brand-50 focus-visible:ring-brand-200"
          : "bg-action-primary text-action-primary-text hover:bg-action-primary-hover focus-visible:ring-action-primary-focus"
      } ${className}`}
    >
      {children}
      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background-page text-content-primary">
      <PublicHeader />

      <main>
        <section className="border-b border-border-subtle bg-background-page">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:py-24">
            <div className="max-w-2xl">
              <p className="text-caption font-semibold uppercase text-action-primary">Nutri Plan</p>
              <h1 className="mt-4 text-display font-bold text-content-primary sm:text-5xl sm:leading-tight">
                Crie planos alimentares e organize seus pacientes gratuitamente
              </h1>
              <p className="mt-6 max-w-xl text-body-large text-content-secondary">
                O Nutri Plan ajuda nutricionistas a cadastrar pacientes, montar refeicoes, consultar alimentos e gerar planos alimentares profissionais em PDF, tudo em um so lugar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink className="w-full sm:w-auto">Criar conta gratis</PrimaryLink>
                <Link
                  href="#recursos"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-action-secondary px-5 text-button font-semibold text-action-secondary-text transition-colors hover:bg-action-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-secondary-focus"
                >
                  Conhecer os recursos
                </Link>
              </div>
              <p className="mt-6 text-body-small text-content-muted">
                Gratuito para nutricionistas <span aria-hidden="true">-</span> Sem assinatura <span aria-hidden="true">-</span> Acesso pelo navegador
              </p>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section aria-label="Diferenciais" className="border-b border-border-subtle bg-surface-muted">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border-default px-6 lg:grid-cols-4 lg:divide-y-0">
            {differentials.map(({ icon: Icon, label }) => (
              <div key={label} className="group flex min-h-24 items-center gap-3 px-4 py-5 first:border-l-0 lg:px-7">
                <Icon className="h-5 w-5 shrink-0 text-action-primary transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none" aria-hidden="true" />
                <span className="text-body-small font-semibold text-content-primary">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="recursos" className="scroll-mt-6 border-y border-border-subtle bg-background-subtle py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <p className="text-caption font-semibold uppercase text-action-primary">Recursos</p>
              <h2 className="mt-3 text-heading-h1 font-bold text-content-primary">Recursos para simplificar a rotina nutricional</h2>
              <p className="mt-4 text-body-default text-content-secondary">Do cadastro ao PDF, o fluxo foi pensado para manter o trabalho clinico organizado.</p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="border-b-4 border-action-primary bg-surface-default p-6 shadow-sm transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
                <Users className="h-6 w-6 text-action-primary" aria-hidden="true" />
                <h3 className="mt-5 text-heading-h3 font-semibold text-content-primary">Gestao que acompanha cada paciente</h3>
                <p className="mt-3 max-w-xl text-body-default text-content-secondary">Acesse os dados do paciente, consulte seus planos e mantenha o acompanhamento em uma interface clara.</p>
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border-subtle pt-5 text-body-small">
                  <div><p className="font-semibold text-content-primary">Cadastro</p><p className="mt-1 text-content-secondary">Dados essenciais</p></div>
                  <div><p className="font-semibold text-content-primary">Planos</p><p className="mt-1 text-content-secondary">Historico vinculado</p></div>
                </div>
              </article>
              <article className="border-b-4 border-feedback-info-solid bg-surface-default p-6 shadow-sm transition-all duration-300 ease-out will-change-transform hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
                <FileDown className="h-6 w-6 text-feedback-info-text" aria-hidden="true" />
                <h3 className="mt-5 text-heading-h3 font-semibold text-content-primary">Do planejamento ao documento final</h3>
                <p className="mt-3 max-w-xl text-body-default text-content-secondary">Monte refeicoes, confira informacoes nutricionais e gere o PDF do plano sem alternar entre ferramentas.</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-5 text-body-small text-content-secondary">
                  <UtensilsCrossed className="h-4 w-4 text-action-primary" aria-hidden="true" /> Refeicoes e opcoes
                  <FileText className="ml-auto h-4 w-4 text-feedback-info-text" aria-hidden="true" /> PDF
                </div>
              </article>
            </div>

            <div className="mt-8 grid gap-x-8 gap-y-0 border-y border-border-default md:grid-cols-2 xl:grid-cols-3">
              {resources.map(({ icon: Icon, title, description }) => (
                <article key={title} className="flex gap-4 border-b border-border-subtle py-6 last:border-b-0 md:[&:nth-last-child(2)]:border-b-0 xl:[&:nth-last-child(-n+3)]:border-b-0">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-action-primary" aria-hidden="true" />
                  <div><h3 className="font-semibold text-content-primary">{title}</h3><p className="mt-1 text-body-small text-content-secondary">{description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-6 mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl"><p className="text-caption font-semibold uppercase text-action-primary">Como funciona</p><h2 className="mt-3 text-heading-h1 font-bold text-content-primary">Do cadastro ao plano alimentar em poucos passos</h2></div>
          <ol className="mt-10 grid gap-0 border border-border-default md:grid-cols-3 md:divide-x md:divide-divider-default">
            {[
              ["Cadastre o paciente", "Adicione as informacoes necessarias para organizar o atendimento."],
              ["Crie o plano alimentar", "Monte refeicoes, opcoes, alimentos e orientacoes conforme sua conduta profissional."],
              ["Gere e compartilhe", "Exporte o plano alimentar em PDF para encaminhar ao paciente."],
            ].map(([title, description], index) => (
              <li key={title} className="border-b border-border-default p-6 transition-colors duration-200 ease-out hover:bg-background-subtle last:border-b-0 md:border-b-0 motion-reduce:transition-none"><span className="text-caption font-bold text-action-primary">ETAPA 0{index + 1}</span><h3 className="mt-5 text-heading-h3 font-semibold text-content-primary">{title}</h3><p className="mt-3 text-body-small text-content-secondary">{description}</p></li>
            ))}
          </ol>
        </section>

        <section className="border-y border-border-subtle bg-brand-50 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl"><p className="text-caption font-semibold uppercase text-action-primary">Acesso gratuito</p><h2 className="mt-3 text-heading-h1 font-bold text-content-primary">Uma ferramenta de acesso gratuito para nutricionistas</h2><p className="mt-4 text-body-default text-content-secondary">O Nutri Plan foi criado para ampliar o acesso a ferramentas de organizacao e planejamento nutricional, sem exigir uma assinatura mensal para utilizar seus principais recursos.</p></div>
            <span className="text-body-small font-semibold text-content-secondary">Projeto em evolucao</span>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
          <article className="border-l-4 border-action-primary pl-6"><ShieldCheck className="h-6 w-6 text-action-primary" aria-hidden="true" /><h2 className="mt-5 text-heading-h2 font-bold text-content-primary">Informacoes de pacientes merecem cuidado</h2><p className="mt-4 text-body-default text-content-secondary">O acesso a area de trabalho exige autenticacao, e a sessao e administrada pelo servidor. O Nutri Plan trata dados de atendimento com a responsabilidade que eles pedem.</p></article>
          <article id="sobre" className="scroll-mt-6 border-l-4 border-feedback-info-solid pl-6"><Leaf className="h-6 w-6 text-feedback-info-text" aria-hidden="true" /><h2 className="mt-5 text-heading-h2 font-bold text-content-primary">Tecnologia nutricional mais acessivel</h2><p className="mt-4 text-body-default text-content-secondary">O Nutri Plan e um projeto em evolucao, criado para ajudar nutricionistas a organizar atendimentos e produzir planos alimentares de forma mais simples.</p></article>
        </section>

        <section className="border-y border-border-subtle bg-background-subtle py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-caption font-semibold uppercase text-action-primary">Feedback</p><h2 className="mt-3 text-heading-h2 font-bold text-content-primary">Ajude a construir o Nutri Plan</h2><p className="mt-3 max-w-2xl text-body-default text-content-secondary">Encontrou um problema ou sentiu falta de algum recurso? Compartilhe sua experiencia e ajude a definir as proximas melhorias da plataforma.</p></div><div className="flex flex-wrap gap-3"><span className="inline-flex h-11 items-center rounded-md border border-border-default bg-surface-default px-4 text-button font-semibold text-content-muted">Sugestoes em preparacao</span><span className="inline-flex h-11 items-center rounded-md border border-border-default bg-surface-default px-4 text-button font-semibold text-content-muted">Canal de problemas em preparacao</span></div></div>
        </section>

        <FaqSection />

        <section className="border-t border-border-subtle bg-brand-900 py-20 text-content-inverse">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><h2 className="text-heading-h1 font-bold">Comece a organizar seus atendimentos com o Nutri Plan</h2><p className="mt-4 text-body-default text-brand-100">Cadastre seus pacientes, crie planos alimentares e gere documentos profissionais sem pagar uma assinatura mensal.</p></div><PrimaryLink inverted>Comecar a criar planos</PrimaryLink></div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
