import Link from "next/link";
import { Leaf } from "lucide-react";

const groups = [
  { title: "Produto", links: [{ label: "Recursos", href: "#recursos" }, { label: "Como funciona", href: "#como-funciona" }, { label: "Novidades" }] },
  { title: "Projeto", links: [{ label: "Sobre", href: "#sobre" }, { label: "Feedback" }, { label: "Contato" }] },
  { title: "Ajuda", links: [{ label: "FAQ", href: "#faq" }, { label: "Relatar problema" }] },
  { title: "Legal", links: [{ label: "Politica de privacidade" }, { label: "Termos de uso" }, { label: "Solicitacao de exclusao de dados" }] },
];

export default function PublicFooter() {
  return (
    <footer className="bg-surface-default"><div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-action-primary"><Leaf className="h-5 w-5 text-action-primary-text" aria-hidden="true" /></span><span className="text-heading-h4 font-bold text-content-primary">Nutri Plan</span></div><p className="mt-4 max-w-xs text-body-small text-content-secondary">Ferramentas simples para a organizacao da rotina nutricional.</p></div>{groups.map((group) => <div key={group.title}><h2 className="text-caption font-semibold uppercase text-content-secondary">{group.title}</h2><ul className="mt-4 space-y-3">{group.links.map((link) => <li key={link.label}>{link.href ? <Link href={link.href} className="text-body-small text-content-secondary transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus">{link.label}</Link> : <span className="text-body-small text-content-muted">{link.label}</span>}</li>)}</ul></div>)}</div><div className="border-t border-border-subtle"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-caption text-content-muted sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Nutri Plan. Todos os direitos reservados.</span><span>Feito para a rotina nutricional.</span></div></div></footer>
  );
}
