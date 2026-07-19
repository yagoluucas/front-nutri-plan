"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CookingPot, Leaf, Menu, User, Users, X } from "lucide-react";
import LogoutButton from "@/src/features/auth/components/LogoutButton";
import { useProfile } from "@/src/features/profile/ProfileProvider";
import { getNameInitials } from "@/src/utils/getNameInitials";

const navigationItems = [
    { href: "/dashboard", label: "Inicio", icon: BarChart3 },
    { href: "/pacientes", label: "Meus pacientes", icon: Users },
    { href: "/meu-perfil", label: "Meu perfil", icon: User },
    { href: "/receitas", label: "Receitas", icon: CookingPot },
];

interface SidebarContentOptions {
    isCollapsed: boolean;
    isMobile?: boolean;
    onNavigate?: () => void;
}

export default function AppSidebar() {
    const pathname = usePathname();
    const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { profile } = useProfile();
    const profileImage = profile.fotoPerfil ?? profile.imagemPerfil;
    const profileName = [profile.nome, profile.sobrenome].filter(Boolean).join(" ").trim();
    const profileLabel = profileName || "Nutricionista";
    const profileInitials = getNameInitials(profileName);

    useEffect(() => {
        if (!isMobileOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobileOpen]);

    const renderSidebarContent = ({
        isCollapsed,
        isMobile = false,
        onNavigate,
    }: SidebarContentOptions) => {
        const labelTransitionClass = isCollapsed
            ? "max-w-0 -translate-x-1 opacity-0"
            : "max-w-48 translate-x-0 opacity-100";

        return (
            <div className="flex h-full min-h-0 flex-col">
                {isMobile ? (
                    <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle px-4">
                        <Link
                            href="/pacientes"
                            onClick={onNavigate}
                            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-action-primary">
                                <Leaf className="h-5 w-5 text-white" />
                            </span>
                            <span className="truncate text-heading-h4 font-bold text-content-primary">Nutri Plan</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(false)}
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-secondary transition-colors hover:bg-background-subtle hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                            aria-label="Fechar menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                ) : (
                    <div className="flex h-16 shrink-0 items-center border-b border-border-subtle">
                        <div className="flex h-full w-20 shrink-0 items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setIsDesktopExpanded((current) => !current)}
                                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-action-primary transition-colors hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                                aria-label={isDesktopExpanded ? "Recolher menu lateral" : "Expandir menu lateral"}
                                title={isDesktopExpanded ? "Recolher menu" : "Expandir menu"}
                            >
                                <Leaf className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        <Link
                            href="/pacientes"
                            className={`overflow-hidden whitespace-nowrap text-heading-h4 font-bold text-content-primary transition-[max-width,opacity,transform] duration-200 ease-out ${labelTransitionClass}`}
                            tabIndex={isCollapsed ? -1 : 0}
                            aria-hidden={isCollapsed}
                        >
                            Nutri Plan
                        </Link>
                    </div>
                )}

                <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex h-11 min-w-0 items-center gap-3 rounded-md px-3 text-body-small font-semibold transition-colors ${
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
                    <div className="mb-3 flex h-14 min-w-0 items-center gap-3 overflow-hidden rounded-md bg-background-subtle px-3">
                        <span className="flex w-8 shrink-0 justify-center">
                            {profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profileImage}
                                    alt="Foto de perfil"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-body-small font-bold text-action-primary">
                                    {profileInitials}
                                </span>
                            )}
                        </span>
                        <span
                            className={`truncate transition-[max-width,opacity,transform] duration-200 ease-out ${labelTransitionClass}`}
                            title={profileLabel}
                        >
                            {profileLabel}
                        </span>
                    </div>

                    <LogoutButton isCollapsed={isCollapsed} />
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface-default px-4 md:hidden">
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-content-primary transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                    aria-label="Abrir menu"
                    aria-expanded={isMobileOpen}
                    aria-controls="mobile-app-sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <Link
                    href="/pacientes"
                    className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                >
                    <Leaf className="h-5 w-5 shrink-0 text-action-primary" />
                    <span className="truncate text-heading-h4 font-bold text-content-primary">Nutri Plan</span>
                </Link>
            </header>

            {isMobileOpen && (
                <aside
                    id="mobile-app-sidebar"
                    className="fixed inset-0 z-50 h-dvh w-full overflow-hidden bg-surface-default md:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu principal"
                >
                    {renderSidebarContent({
                        isCollapsed: false,
                        isMobile: true,
                        onNavigate: () => setIsMobileOpen(false),
                    })}
                </aside>
            )}

            <aside
                className={`relative z-40 hidden h-full shrink-0 overflow-hidden border-r border-border-subtle bg-surface-default transition-[width] duration-300 ease-out md:block ${
                    isDesktopExpanded ? "w-64" : "w-20"
                }`}
            >
                {renderSidebarContent({ isCollapsed: !isDesktopExpanded })}
            </aside>
        </>
    );
}
