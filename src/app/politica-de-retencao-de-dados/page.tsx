import type { Metadata } from "next";
import Link from "next/link";
import {
  ArchiveRestore,
  Clock3,
  Database,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import PublicFooter from "@/src/features/marketing/components/PublicFooter";
import PublicHeader from "@/src/features/marketing/components/PublicHeader";

export const metadata: Metadata = {
  title: "Política de Retenção de Dados",
  description:
    "Saiba por quanto tempo o Nutri Plan mantém dados de nutricionistas, pacientes e planos alimentares e como funciona a exclusão de backups.",
};

const policySections = [
  { href: "#aceite", label: "Aceite da política" },
  { href: "#dados", label: "Dados abrangidos" },
  { href: "#armazenamento", label: "Armazenamento e segurança" },
  { href: "#prazos", label: "Prazos de retenção" },
  { href: "#exclusao", label: "Exclusão e backups" },
  { href: "#direitos", label: "Seus direitos" },
  { href: "#suporte", label: "Contato e suporte" },
];

const dataCategories = [
  {
    icon: UserRound,
    title: "Dados do nutricionista",
    description:
      "Dados cadastrais e profissionais, como nome, e-mail, data de nascimento e CRN, além das informações necessárias para autenticação e administração da conta.",
  },
  {
    icon: Users,
    title: "Dados de pacientes",
    description:
      "Dados cadastrais e informações fornecidas pelo nutricionista para organizar o acompanhamento. Dados relacionados à saúde recebem a proteção reforçada prevista na LGPD.",
  },
  {
    icon: FileText,
    title: "Planos alimentares",
    description:
      "Refeições, alimentos, porções, orientações, cálculos nutricionais e demais informações vinculadas ao planejamento alimentar do paciente.",
  },
];

export default function DataRetentionPolicyPage() {
  return (
    <div className="min-h-screen bg-background-page text-content-primary">
      <PublicHeader />

      <main>
        <header className="border-b border-border-subtle bg-background-subtle">
          <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-sm bg-brand-50 px-3 py-1.5 text-caption font-semibold uppercase text-action-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Privacidade e LGPD
              </div>
              <h1 className="mt-5 text-display font-bold text-content-primary sm:text-5xl sm:leading-tight">
                Política de Retenção de Dados
              </h1>
              <p className="mt-5 max-w-2xl text-body-large text-content-secondary">
                Esta política explica quais dados o Nutri Plan mantém, por quanto
                tempo eles são necessários e o que acontece depois de uma
                solicitação de exclusão.
              </p>
              <p className="mt-6 text-body-small text-content-muted">
                Última atualização: 22 de agosto de 2026
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-16">
          <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Nesta política">
            <p className="text-caption font-semibold uppercase text-content-muted">
              Nesta política
            </p>
            <nav className="mt-4 border-l border-border-default">
              {policySections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="block border-l-2 border-transparent py-2 pl-4 text-body-small text-content-secondary transition-colors hover:border-action-primary hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                >
                  {section.label}
                </Link>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 max-w-4xl">
            <section className="grid gap-4 sm:grid-cols-2" aria-label="Resumo dos prazos">
              <div className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-action-primary">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-caption font-semibold uppercase text-content-muted">
                      Backup após exclusão
                    </p>
                    <p className="mt-1 text-heading-h2 font-bold text-content-primary">
                      Até 30 dias
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-body-small text-content-secondary">
                  Para os dados da conta e do perfil do nutricionista.
                </p>
              </div>

              <div className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-feedback-info-bg text-feedback-info-text">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-caption font-semibold uppercase text-content-muted">
                      Backup após exclusão
                    </p>
                    <p className="mt-1 text-heading-h2 font-bold text-content-primary">
                      Até 365 dias
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-body-small text-content-secondary">
                  Para dados de pacientes e seus planos alimentares.
                </p>
              </div>
            </section>

            <div className="mt-6 rounded-lg border border-feedback-warning-border bg-feedback-warning-bg p-5">
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-feedback-warning-text" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold text-feedback-warning-text">
                    A exclusão pode ser definitiva
                  </h2>
                  <p className="mt-2 text-body-small text-content-secondary">
                    Se uma exclusão foi feita por engano, contate o suporte o mais
                    rápido possível. A existência de uma cópia de backup não garante
                    recuperação individual. Encerrado o prazo aplicável, os dados são
                    eliminados dos backups e não poderão ser recuperados.
                  </p>
                </div>
              </div>
            </div>

            <section id="aceite" className="scroll-mt-8 border-b border-border-subtle py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                1. Aceite e abrangência
              </h2>
              <div className="mt-4 space-y-4 text-body-default text-content-secondary">
                <p>
                  Ao selecionar a opção de criar uma conta, o nutricionista declara
                  que leu e aceita os Termos de Uso e esta Política de Retenção de
                  Dados. Esta política integra as regras aplicáveis ao uso do Nutri
                  Plan e deve ser lida em conjunto com os demais avisos de privacidade
                  apresentados pela plataforma.
                </p>
                <p>
                  Caso esta política seja alterada de forma relevante, o Nutri Plan
                  informará os usuários pelos canais disponíveis e solicitará uma nova
                  manifestação quando isso for exigido pela legislação aplicável.
                </p>
              </div>
            </section>

            <section id="dados" className="scroll-mt-8 border-b border-border-subtle py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                2. Quais dados esta política abrange
              </h2>
              <p className="mt-4 text-body-default text-content-secondary">
                A retenção varia conforme a natureza do dado e sua finalidade. As
                principais categorias são:
              </p>
              <div className="mt-6 grid gap-4">
                {dataCategories.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4 rounded-lg border border-border-default bg-surface-default p-5">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-action-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-content-primary">{title}</h3>
                      <p className="mt-2 text-body-small text-content-secondary">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-body-small text-content-muted">
                Registros técnicos e de segurança podem ser mantidos pelo período
                estritamente necessário para prevenir fraudes, investigar incidentes,
                manter a integridade do serviço e cumprir obrigações legais.
              </p>
            </section>

            <section id="armazenamento" className="scroll-mt-8 border-b border-border-subtle py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                3. Como os dados são armazenados e protegidos
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="border-l-4 border-action-primary pl-5">
                  <Database className="h-5 w-5 text-action-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-content-primary">Ambiente operacional</h3>
                  <p className="mt-2 text-body-small text-content-secondary">
                    Os dados utilizados no dia a dia ficam na infraestrutura necessária
                    ao funcionamento da plataforma, com acesso limitado às pessoas e aos
                    serviços autorizados.
                  </p>
                </div>
                <div className="border-l-4 border-feedback-info-solid pl-5">
                  <ArchiveRestore className="h-5 w-5 text-feedback-info-text" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-content-primary">Cópias de backup</h3>
                  <p className="mt-2 text-body-small text-content-secondary">
                    Backups existem para continuidade e recuperação do serviço em caso
                    de falha ou incidente. Eles têm acesso restrito e não são usados para
                    a operação cotidiana da conta.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3 rounded-lg bg-background-subtle p-5">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-action-primary" aria-hidden="true" />
                <p className="text-body-small text-content-secondary">
                  O Nutri Plan adota medidas técnicas e administrativas compatíveis com
                  o risco para reduzir acessos não autorizados, perdas, alterações e
                  divulgações indevidas. Nenhum sistema é absolutamente imune a riscos,
                  e os controles são revistos conforme a evolução da plataforma.
                </p>
              </div>
            </section>

            <section id="prazos" className="scroll-mt-8 border-b border-border-subtle py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                4. Por quanto tempo os dados são mantidos
              </h2>
              <p className="mt-4 text-body-default text-content-secondary">
                Enquanto a conta estiver ativa, os dados são mantidos pelo tempo
                necessário para prestar o serviço, cumprir as finalidades informadas e
                atender obrigações legais ou regulatórias. Após uma exclusão concluída,
                aplicam-se os seguintes limites para cópias de backup:
              </p>

              <div className="mt-6 overflow-hidden rounded-lg border border-border-default">
                <table className="w-full text-left text-body-small">
                  <thead className="bg-surface-muted text-content-secondary">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Categoria</th>
                      <th scope="col" className="px-4 py-3 font-semibold">No ambiente operacional</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Em backups após a exclusão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider-default text-content-primary">
                    <tr>
                      <th scope="row" className="px-4 py-4 font-semibold">Conta e perfil do nutricionista</th>
                      <td className="px-4 py-4 text-content-secondary">Até a exclusão ser concluída</td>
                      <td className="px-4 py-4 font-semibold text-action-primary">Até 30 dias corridos</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-4 font-semibold">Dados de pacientes</th>
                      <td className="px-4 py-4 text-content-secondary">Até a exclusão ser concluída</td>
                      <td className="px-4 py-4 font-semibold text-action-primary">Até 365 dias corridos</td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-4 py-4 font-semibold">Planos alimentares</th>
                      <td className="px-4 py-4 text-content-secondary">Até a exclusão ser concluída</td>
                      <td className="px-4 py-4 font-semibold text-action-primary">Até 365 dias corridos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-body-small text-content-muted">
                Os prazos contam da conclusão da exclusão da categoria correspondente.
                Uma cópia poderá ser substituída ou eliminada antes do limite indicado.
              </p>
            </section>

            <section id="exclusao" className="scroll-mt-8 border-b border-border-subtle py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                5. O que acontece após a exclusão
              </h2>
              <ol className="mt-6 space-y-5">
                {[
                  ["Remoção do uso cotidiano", "A informação deixa de ficar disponível na área operacional correspondente após a exclusão ser concluída."],
                  ["Retenção temporária em backup", "Cópias residuais podem permanecer até o limite de 30 ou 365 dias, conforme a categoria. Durante esse período, ficam destinadas à segurança e à recuperação do ambiente, e não ao uso normal da conta."],
                  ["Expurgo definitivo", "Ao fim do ciclo aplicável, as cópias são eliminadas ou sobrescritas de forma segura e deixam de ser recuperáveis."],
                ].map(([title, description], index) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-action-primary text-caption font-bold text-action-primary-text">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-content-primary">{title}</h3>
                      <p className="mt-1 text-body-small text-content-secondary">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-7 flex gap-3 rounded-lg border border-feedback-error-border bg-feedback-error-bg p-5">
                <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-feedback-error-text" aria-hidden="true" />
                <p className="text-body-small text-content-secondary">
                  Uma solicitação de exclusão não será atendida integralmente quando a
                  conservação for necessária para cumprir obrigação legal ou regulatória,
                  exercer direitos em processo ou atender outra hipótese permitida pelos
                  artigos 15 e 16 da LGPD. Nesses casos, os dados ficam restritos à
                  finalidade que justificou sua conservação e pelo período necessário.
                </p>
              </div>
            </section>

            <section id="direitos" className="scroll-mt-8 border-b border-border-subtle py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                6. Direitos dos titulares
              </h2>
              <p className="mt-4 text-body-default text-content-secondary">
                Nos termos da LGPD, o titular pode solicitar, conforme aplicável, a
                confirmação do tratamento, o acesso, a correção, a portabilidade, a
                informação sobre compartilhamentos, a anonimização, o bloqueio ou a
                eliminação de dados, além da revogação do consentimento. A identidade do
                solicitante poderá ser verificada antes do atendimento para proteger os
                próprios dados.
              </p>
              <p className="mt-4 text-body-default text-content-secondary">
                Em relação aos dados dos pacientes, o nutricionista define os dados
                inseridos e as finalidades do acompanhamento profissional. O Nutri Plan
                fornece a infraestrutura de tratamento e atende às responsabilidades que
                lhe forem aplicáveis, inclusive no suporte ao exercício de direitos.
              </p>
            </section>

            <section id="suporte" className="scroll-mt-8 py-10">
              <h2 className="text-heading-h2 font-bold text-content-primary">
                7. Contato e suporte
              </h2>
              <p className="mt-4 text-body-default text-content-secondary">
                Para esclarecer dúvidas, exercer direitos ou informar uma exclusão
                acidental, entre em contato pelos canais oficiais de suporte
                disponibilizados no Nutri Plan. Faça isso o quanto antes: após o término
                do prazo de backup aplicável, não será possível recuperar os dados.
              </p>
              <p className="mt-4 text-body-small text-content-muted">
                Para sua segurança, não envie senhas nem dados clínicos completos por
                canais públicos ou não verificados.
              </p>

              <div className="mt-7 rounded-lg border border-border-default bg-background-subtle p-5">
                <p className="text-body-small text-content-secondary">
                  Esta política foi elaborada com referência à Lei nº 13.709/2018 e às
                  orientações da Autoridade Nacional de Proteção de Dados.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-body-small font-semibold">
                  <a
                    href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                    target="_blank"
                    rel="noreferrer"
                    className="text-action-primary hover:text-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                  >
                    Consultar a LGPD
                  </a>
                  <a
                    href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares"
                    target="_blank"
                    rel="noreferrer"
                    className="text-action-primary hover:text-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                  >
                    Direitos dos titulares na ANPD
                  </a>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
