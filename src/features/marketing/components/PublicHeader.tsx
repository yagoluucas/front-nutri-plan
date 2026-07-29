"use client";

import Link from "next/link";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#sobre", label: "Sobre o projeto" },
  { href: "#faq", label: "FAQ" },
];

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="border-b border-border-subtle bg-surface-default">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-0 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-action-primary"><Leaf className="h-5 w-5 text-action-primary-text" aria-hidden="true" /></span>
          <span className="text-heading-h4 font-bold text-content-primary">Nutri Plan</span>
        </Link>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-md text-content-primary hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus md:hidden" aria-label={isOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={isOpen} aria-controls="public-navigation" onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <nav id="public-navigation" className={`grid w-full transition-[grid-template-rows,opacity,margin] duration-200 ease-out motion-reduce:transition-none ${isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"} md:mt-0 md:block md:w-auto md:opacity-100 md:pointer-events-auto`} aria-label="Navegacao principal">
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 border-t border-border-subtle pt-4 md:flex-row md:items-center md:gap-6 md:border-0 md:pt-0">
              {navItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-md px-3 py-2 text-body-small font-medium text-content-secondary transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus">{item.label}</Link>)}
              <Link href="/login" onClick={closeMenu} className="inline-flex h-10 items-center justify-center rounded-md bg-action-primary px-4 text-button font-semibold text-action-primary-text shadow-sm transition-[background-color,transform,box-shadow] hover:bg-action-primary-hover hover:shadow-md active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus motion-reduce:transition-none">Comecar agora</Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
