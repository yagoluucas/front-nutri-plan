"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmRegistrationApi } from "../services/auth.service";
import ResendConfirmationForm from "./ResendConfirmationForm";

type ConfirmationState =
    | { status: "loading" }
    | { status: "success"; message: string }
    | { status: "error"; message: string };

export default function ConfirmEmail() {
    const router = useRouter();
    const confirmationStarted = useRef(false);
    const [confirmationState, setConfirmationState] = useState<ConfirmationState>({ status: "loading" });

    useEffect(() => {
        if (confirmationStarted.current) {
            return;
        }

        confirmationStarted.current = true;

        const params = new URLSearchParams(window.location.hash.slice(1));
        const token = params.get("token");

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
        );

        const confirmationRequest = token
            ? confirmRegistrationApi({ token })
            : Promise.reject(new Error("Link de confirmação inválido ou expirado."));

        void confirmationRequest
            .then((response) => {
                setConfirmationState({ status: "success", message: response.message });
                toast.success(response.message);
                router.replace("/login");
            })
            .catch((error: unknown) => {
                setConfirmationState({
                    status: "error",
                    message: error instanceof Error
                        ? error.message
                        : "Não foi possível confirmar o e-mail.",
                });
            });
    }, [router]);

    if (confirmationState.status === "loading") {
        return (
            <div className="text-center" role="status" aria-live="polite">
                <LoaderCircle className="mx-auto size-10 animate-spin text-action-primary" aria-hidden="true" />
                <h1 className="mt-6 text-heading-h2 font-bold text-content-primary">Confirmando seu e-mail</h1>
                <p className="mt-2 text-body-default text-content-secondary">
                    Aguarde enquanto validamos o link de confirmação.
                </p>
            </div>
        );
    }

    if (confirmationState.status === "success") {
        return (
            <div className="text-center" role="status" aria-live="polite">
                <h1 className="text-heading-h2 font-bold text-feedback-success-text">E-mail confirmado</h1>
                <p className="mt-3 text-body-default text-content-secondary">{confirmationState.message}</p>
                <p className="mt-2 text-body-small text-content-muted">Redirecionando para o login...</p>
            </div>
        );
    }

    return (
        <div aria-live="polite">
            <div className="rounded-lg border border-feedback-error-border bg-feedback-error-bg p-6 text-center">
                <CircleAlert className="mx-auto size-10 text-feedback-error-solid" aria-hidden="true" />
                <h1 className="mt-4 text-heading-h2 font-bold text-feedback-error-text">Não foi possível confirmar</h1>
                <p className="mt-3 text-body-default text-content-secondary">{confirmationState.message}</p>
            </div>

            <div className="mt-8">
                <ResendConfirmationForm />
            </div>

            <div className="mt-8 text-center">
                <Link
                    href="/login"
                    className="font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                >
                    Voltar para o login
                </Link>
            </div>
        </div>
    );
}
