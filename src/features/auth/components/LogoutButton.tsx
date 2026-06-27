"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LOGIN_ROUTE } from "../constants";
import { clearAuthToken, logoutApi } from "../services/auth.service";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            toast.error("Não foi possível encerrar a sessão no servidor.");
        } finally {
            clearAuthToken();
            router.replace(LOGIN_ROUTE);
            router.refresh();
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="text-body-small font-medium text-feedback-error-text flex items-center gap-2 hover:bg-feedback-error-bg p-2 rounded-lg transition-colors"
            title="Sair"
        >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
        </button>
    );
}
