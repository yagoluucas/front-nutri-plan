"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "../schemas/auth.schemas";
import { z } from "zod";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    getPostAuthRedirectPath,
    registerApi,
} from "../services/auth.service";

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof registerSchema>, unknown, RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const response = await registerApi(data);
            toast.success(response.message || "Cadastro realizado com sucesso!", {
                description: "Você será direcionado para criar seu plano alimentar.",
            });
            await new Promise((resolve) => setTimeout(resolve, 1200));
            router.replace(getPostAuthRedirectPath());
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao realizar cadastro.");
        }
    };

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
                            placeholder="00000000"
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
