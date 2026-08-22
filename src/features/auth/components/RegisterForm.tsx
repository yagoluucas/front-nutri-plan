"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas/auth.schemas";
import { z } from "zod";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";

import { toast } from "sonner";
import { registerApi } from "../services/auth.service";
import ResendConfirmationForm from "./ResendConfirmationForm";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof registerSchema>, unknown, RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await registerApi(data);
            setConfirmationEmail(data.email);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao realizar cadastro.");
        }
    };

    if (confirmationEmail) {
        return (
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
                <div className="rounded-lg border border-feedback-success-border bg-feedback-success-bg p-6 text-center">
                    <h1 className="text-heading-h2 font-bold text-feedback-success-text">Verifique seu e-mail</h1>
                    <p className="mt-3 text-body-default text-content-secondary" role="status">
                        Enviamos um link de confirmação para o e-mail informado no cadastro. Confira também a caixa de spam.
                    </p>
                </div>

                <div className="mt-8">
                    <ResendConfirmationForm initialEmail={confirmationEmail} />
                </div>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-semibold text-brand-600 hover:text-brand-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        Voltar para o login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
            <div className="text-center mb-8">
                <h1 className="text-heading-h2 font-bold text-content-primary mb-2">Crie sua conta</h1>
                <p className="text-body-default text-content-secondary">
                    Junte-se a nós e transforme a gestão dos seus pacientes.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                            id="nome"
                            type="text"
                            placeholder="Seu nome"
                            {...register("nome")}
                            error={errors.nome?.message}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sobrenome">Sobrenome</Label>
                        <Input
                            id="sobrenome"
                            type="text"
                            placeholder="Seu sobrenome"
                            {...register("sobrenome")}
                            error={errors.sobrenome?.message}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                        <Input
                            id="dataNascimento"
                            type="date"
                            {...register("dataNascimento", { valueAsDate: true })}
                            error={errors.dataNascimento?.message}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="crn">CRN</Label>
                        <Input
                            id="crn"
                            type="text"
                            placeholder="00000"
                            {...register("crn")}
                            error={errors.crn?.message}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="senha">Senha</Label>
                        <Input
                            id="senha"
                            type="password"
                            placeholder="Sua senha"
                            autoComplete="new-password"
                            {...register("senha")}
                            error={errors.senha?.message}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmacaoSenha">Confirme a senha</Label>
                        <Input
                            id="confirmacaoSenha"
                            type="password"
                            placeholder="Repita a senha"
                            autoComplete="new-password"
                            {...register("confirmacaoSenha")}
                            error={errors.confirmacaoSenha?.message}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <p className="mb-4 text-center text-caption text-content-muted">
                        Ao criar sua conta, você declara que leu e aceita os Termos de Uso e a{" "}
                        <Link
                            href="/politica-de-retencao-de-dados"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-action-primary hover:text-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus"
                        >
                            Política de Retenção de Dados
                        </Link>
                        .
                    </p>
                    <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Criando conta..." : "Criar minha conta"}
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-body-small text-content-secondary">
                    Já tem uma conta?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-semibold text-brand-600 hover:text-brand-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        Fazer login
                    </button>
                </p>
            </div>
        </div>
    );
}
