"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import { patientFormSchema, PatientFormValues } from "../schemas/patient.schemas";

interface PatientFormProps {
    defaultValues?: Partial<PatientFormValues>;
    isSubmitting?: boolean;
    submitLabel?: string;
    onCancel: () => void;
    onSubmit: (values: PatientFormValues) => void | Promise<void>;
}

const textareaClasses = "w-full min-h-28 rounded-lg border border-border-default bg-surface-default p-4 text-body-default text-content-primary placeholder:text-content-placeholder shadow-sm transition-all resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus";
const selectClasses = "w-full h-11 rounded-lg border border-border-default bg-surface-default px-4 text-body-default text-content-primary shadow-sm appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus transition-all";

export default function PatientForm({
    defaultValues,
    isSubmitting = false,
    submitLabel = "Salvar paciente",
    onCancel,
    onSubmit,
}: PatientFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.input<typeof patientFormSchema>, unknown, PatientFormValues>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            nome: defaultValues?.nome || "",
            sobrenome: defaultValues?.sobrenome || "",
            email: defaultValues?.email || "",
            dataNascimento: defaultValues?.dataNascimento || "",
            sexo: defaultValues?.sexo,
            observacoes: defaultValues?.observacoes || "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Linha 1: Nome + Sobrenome */}
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                        id="nome"
                        type="text"
                        placeholder="Nome do paciente"
                        {...register("nome")}
                        error={errors.nome?.message}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input
                        id="sobrenome"
                        type="text"
                        placeholder="Sobrenome do paciente"
                        {...register("sobrenome")}
                        error={errors.sobrenome?.message}
                    />
                </div>

                {/* Linha 2: E-mail + Data de nascimento */}
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="paciente@email.com"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de nascimento</Label>
                    <Input
                        id="dataNascimento"
                        type="date"
                        {...register("dataNascimento")}
                        error={errors.dataNascimento?.message}
                    />
                </div>

                {/* Linha 3: Sexo (meia largura) */}
                <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <div className="relative">
                        <select
                            id="sexo"
                            className={`${selectClasses} ${errors.sexo ? "border-feedback-error-border" : ""}`}
                            {...register("sexo")}
                        >
                            <option value="">Selecione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-content-secondary">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                    {errors.sexo?.message && (
                        <span className="text-caption text-feedback-error-text">{errors.sexo.message}</span>
                    )}
                </div>

                {/* Linha 4: Observações (largura total) */}
                <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="observacoes">Observacoes</Label>
                    <textarea
                        id="observacoes"
                        placeholder="Alergias, preferencias alimentares, rotina ou pontos importantes."
                        className={`${textareaClasses} ${errors.observacoes ? "border-feedback-error-border" : ""}`}
                        {...register("observacoes")}
                    />
                    {errors.observacoes?.message && (
                        <span className="text-caption text-feedback-error-text">{errors.observacoes.message}</span>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
