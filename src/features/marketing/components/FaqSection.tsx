"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const questions = [
  ["O Nutri Plan e gratuito?", "Sim. A plataforma apresenta acesso gratuito para nutricionistas e seus principais recursos nao exigem assinatura mensal."],
  ["Quem pode utilizar a plataforma?", "O Nutri Plan foi pensado para nutricionistas que desejam organizar pacientes e elaborar planos alimentares."],
  ["Preciso instalar algum programa?", "Nao. O acesso e feito pelo navegador."],
  ["Posso gerar o plano alimentar em PDF?", "Sim. O plano pode ser gerado em PDF a partir da plataforma."],
  ["Os dados dos pacientes ficam protegidos?", "A area de trabalho exige autenticacao e a sessao e tratada no servidor. Seguimos evoluindo os cuidados da plataforma com esses dados."],
  ["Como posso sugerir uma funcionalidade?", "O canal de feedback esta em preparacao. A pagina vai sinalizar quando estiver disponivel."],
  ["O Nutri Plan substitui a avaliacao do nutricionista?", "Nao. O Nutri Plan e uma ferramenta de apoio e nao substitui avaliacao, conduta ou acompanhamento profissional."],
];

export default function FaqSection() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-6 mx-auto max-w-4xl px-6 py-20">
      <div className="text-center"><p className="text-caption font-semibold uppercase text-action-primary">FAQ</p><h2 className="mt-3 text-heading-h1 font-bold text-content-primary">Duvidas frequentes</h2></div>
      <div className="mt-10 divide-y divide-divider-default border-y border-divider-default">
        {questions.map(([question, answer], index) => {
          const isOpen = openQuestion === index;
          const contentId = `faq-answer-${index}`;

          return (
            <article key={question} className="py-1">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => setOpenQuestion((current) => current === index ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 py-5 text-left text-body-default font-semibold text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                >
                  <span>{question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-content-secondary transition-transform duration-200 ease-out motion-reduce:transition-none ${isOpen ? "rotate-180" : "rotate-0"}`} aria-hidden="true" />
                </button>
              </h3>
              <div id={contentId} role="region" aria-label={question} className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden"><p className="max-w-3xl pb-5 text-body-small text-content-secondary">{answer}</p></div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
