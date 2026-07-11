"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LOGIN_ROUTE } from "../constants";
import { logoutApi } from "../services/auth.service";

interface LogoutButtonProps {
    isCollapsed?: boolean;
}

export default function LogoutButton({ isCollapsed = false }: LogoutButtonProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const labelTransitionClass = isCollapsed
        ? "max-w-0 -translate-x-1 opacity-0"
        : "max-w-20 translate-x-0 opacity-100";

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            toast.error("Não foi possível encerrar a sessão no servidor.");
        } finally {
            queryClient.clear();
            router.replace(LOGIN_ROUTE);
            router.refresh();
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-full items-center gap-3 overflow-hidden rounded-md px-3 text-body-small font-semibold text-feedback-error-text transition-colors hover:bg-feedback-error-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-feedback-error-border"
            title="Sair"
            aria-label="Sair"
        >
            <span className="flex w-8 shrink-0 justify-center">
                <LogOut size={16} />
            </span>
            <span
                className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ease-out ${labelTransitionClass}`}
            >
                Sair
            </span>
        </button>
    );
}
