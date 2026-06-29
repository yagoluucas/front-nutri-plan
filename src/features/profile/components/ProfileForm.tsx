"use client";

import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import { profileFormSchema, ProfileFormValues } from "../schemas/profile.schemas";
import { NutritionistProfile } from "../types/profile.types";

interface ProfileFormProps {
    profile: NutritionistProfile;
    onSubmit: (values: ProfileFormValues, fotoPerfil?: string) => void;
}

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function getInitials(name: string) {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((item) => item[0])
        .join("")
        .toUpperCase();

    return initials || "NP";
}

export default function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
    const [preview, setPreview] = useState(profile.fotoPerfil);
    const [imageError, setImageError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            nome: profile.nome,
            profissao: profile.profissao,
            crn: profile.crn,
        },
    });
    const initials = getInitials(profile.nome);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setImageError(null);

        if (!file) {
            return;
        }

        if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
            setImageError("Use uma imagem JPG, PNG ou WebP.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setImageError("A imagem deve ter ate 2 MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setPreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const submitProfile = (values: ProfileFormValues) => {
        onSubmit(values, preview);
    };

    return (
        <form onSubmit={handleSubmit(submitProfile)} className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-heading-h2 font-bold text-action-primary">
                        {preview ? (
                            <Image src={preview} alt="Foto de perfil" fill sizes="128px" className="object-cover" />
                        ) : (
                            initials
                        )}
                    </div>

                    <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-md bg-action-secondary px-4 py-2 text-button font-semibold text-action-secondary-text transition-colors hover:bg-action-secondary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-action-secondary-focus">
                        <Upload className="mr-2 h-4 w-4" />
                        Escolher foto
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={handleImageChange}
                        />
                    </label>

                    {imageError ? (
                        <p className="mt-3 text-body-small text-feedback-error-text">{imageError}</p>
                    ) : (
                        <p className="mt-3 text-body-small text-content-secondary">JPG, PNG ou WebP ate 2 MB.</p>
                    )}
                </div>
            </section>

            <section className="rounded-lg border border-border-default bg-surface-default p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-action-primary">
                        <Camera className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-heading-h3 font-semibold text-content-primary">Dados profissionais</h2>
                        <p className="text-body-small text-content-secondary">Esses dados aparecem no PDF do plano alimentar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="profile_nome">Nome</Label>
                        <Input
                            id="profile_nome"
                            type="text"
                            placeholder="Seu nome"
                            {...register("nome")}
                            error={errors.nome?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile_profissao">Profissao</Label>
                        <Input
                            id="profile_profissao"
                            type="text"
                            placeholder="Nutricionista"
                            {...register("profissao")}
                            error={errors.profissao?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile_crn">CRN</Label>
                        <Input
                            id="profile_crn"
                            type="text"
                            placeholder="CRN 00000"
                            {...register("crn")}
                            error={errors.crn?.message}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
                    </Button>
                </div>
            </section>
        </form>
    );
}
