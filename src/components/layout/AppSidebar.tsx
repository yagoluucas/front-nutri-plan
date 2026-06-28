"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Leaf, User, Users } from "lucide-react";
import LogoutButton from "@/src/features/auth/components/LogoutButton";

const navigationItems = [
    { href: "/dashboard", label: "Inicio", icon: BarChart3 },
    { href: "/pacientes", label: "Meus pacientes", icon: Users },
    { href: "/meu-perfil", label: "Meu perfil", icon: User },
];

export default function AppSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const labelTransitionClass = isExpanded
        ? "max-w-40 translate-x-0 opacity-100"
        : "max-w-0 -translate-x-1 opacity-0";

    return (
        <aside
            className={`relative z-50 h-full shrink-0 overflow-hidden border-r border-border-subtle bg-surface-default transition-[width] duration-300 ease-out ${
                isExpanded ? "w-64" : "w-20"
            }`}
        >
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex h-16 items-center border-b border-border-subtle">
                    <div className="flex h-full w-20 shrink-0 items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setIsExpanded((current) => !current)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-action-primary transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                            aria-label={isExpanded ? "Fechar menu lateral" : "Abrir menu lateral"}
                            title={isExpanded ? "Fechar menu" : "Abrir menu"}
                        >
                            <Leaf className="h-5 w-5 text-white" />
                        </button>
                    </div>

                    <Link
                        href="/pacientes"
                        className={`overflow-hidden whitespace-nowrap text-heading-h4 font-bold text-content-primary transition-[max-width,opacity,transform] duration-200 ease-out ${labelTransitionClass}`}
                        tabIndex={isExpanded ? 0 : -1}
                        aria-hidden={!isExpanded}
                    >
                        Nutri Plan
                    </Link>
                </div>

                <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex h-11 items-center gap-3 rounded-md px-3 text-body-small font-semibold transition-colors ${
                                    isActive
                                        ? "bg-brand-50 text-action-primary"
                                        : "text-content-secondary hover:bg-background-subtle hover:text-content-primary"
                                }`}
                                title={item.label}
                            >
                                <span className="flex w-8 shrink-0 justify-center">
                                    <Icon className="h-5 w-5 shrink-0" />
                                </span>
                                <span
                                    className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out ${labelTransitionClass}`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="shrink-0 border-t border-border-subtle p-3">
                    <div className="mb-3 flex h-14 items-center gap-3 overflow-hidden rounded-md bg-background-subtle px-3">
                        <span className="flex w-8 shrink-0 justify-center">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-body-small font-bold text-action-primary">
                                NP
                            </span>
                        </span>
                        <span
                            className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out ${labelTransitionClass}`}
                        >
                            Nutricionista
                        </span>
                    </div>

                    <LogoutButton isCollapsed={!isExpanded} />
                </div>
            </div>
        </aside>
    );
}
