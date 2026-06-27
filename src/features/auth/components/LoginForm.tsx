"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas/auth.schemas";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        console.log("Login submit: ", data);
        // TODO: call API to login
    };

    return (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
            <div className="text-center mb-8">
                <h1 className="text-heading-h1 font-bold text-content-primary mb-2">Bem-vindo(a) de volta!</h1>
                <p className="text-body-default text-content-secondary">
                    Acesse sua conta para continuar gerenciando seus pacientes.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="senha">Senha</Label>
                            {/* Technical Debt: Forgot password */}
                            <a href="#" className="text-caption font-medium text-brand-600 hover:text-brand-700 transition-colors">
                                Esqueceu a senha?
                            </a>
                        </div>
                        <Input
                            id="senha"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            {...register("senha")}
                            error={errors.senha?.message}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-body-small text-content-secondary">
                    Ainda não tem uma conta?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="font-semibold text-brand-600 hover:text-brand-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        Cadastre-se grátis
                    </button>
                </p>
            </div>
        </div>
    );
}
