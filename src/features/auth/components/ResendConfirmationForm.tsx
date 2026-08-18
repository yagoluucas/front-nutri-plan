"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import {
    resendRegistrationSchema,
    ResendRegistrationValues,
} from "../schemas/auth.schemas";
import { AuthRequestError, resendRegistrationApi } from "../services/auth.service";

interface ResendConfirmationFormProps {
    initialEmail?: string;
}

function formatCooldown(seconds: number) {
    const normalizedSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(normalizedSeconds / 60);
    const remainingSeconds = normalizedSeconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }

    return `${minutes}min ${String(remainingSeconds).padStart(2, "0")}s`;
}

export default function ResendConfirmationForm({ initialEmail = "" }: ResendConfirmationFormProps) {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const [cooldownSeconds, setCooldownSeconds] = useState(initialEmail ? 60 : 0);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResendRegistrationValues>({
        resolver: zodResolver(resendRegistrationSchema),
        defaultValues: { email: initialEmail },
    });

    useEffect(() => {
        if (cooldownSeconds <= 0) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setCooldownSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timeout);
    }, [cooldownSeconds]);

    const onSubmit = async (data: ResendRegistrationValues) => {
        if (cooldownSeconds > 0) {
            return;
        }

        try {
            const { retryAfterSeconds } = await resendRegistrationApi(data);
            setResponseMessage("Solicitação enviada. Confira a caixa de entrada e o spam.");
            setCooldownSeconds(retryAfterSeconds ?? 60);
        } catch (error) {
            if (error instanceof AuthRequestError && error.status === 429) {
                setCooldownSeconds(error.retryAfterSeconds ?? 60);
                setResponseMessage("Muitas solicitações. Aguarde a contagem terminar para tentar novamente.");
                return;
            }

            setResponseMessage(error instanceof Error ? error.message : "Não foi possível reenviar o link.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <h2 className="text-heading-h4 font-semibold text-content-primary">O e-mail não chegou?</h2>
                <p className="mt-1 text-body-small text-content-secondary">
                    {initialEmail
                        ? <>Clique para reenviar para <strong className="font-semibold text-content-primary">{initialEmail}</strong>, o mesmo e-mail usado no cadastro.</>
                        : "Informe o mesmo e-mail usado no cadastro para solicitar um novo envio."}
                </p>
            </div>

            {!initialEmail && (
                <div className="space-y-2">
                    <Label htmlFor="resend-confirmation-email">E-mail</Label>
                    <Input
                        id="resend-confirmation-email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                </div>
            )}

            <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting || cooldownSeconds > 0}>
                {isSubmitting
                    ? "Reenviando..."
                    : cooldownSeconds > 0
                        ? `Aguarde ${formatCooldown(cooldownSeconds)} para reenviar`
                        : "Reenviar novo e-mail"}
            </Button>

            {responseMessage && (
                <p className="text-body-small text-feedback-success-text" role="status">
                    {responseMessage}
                </p>
            )}
        </form>
    );
}
