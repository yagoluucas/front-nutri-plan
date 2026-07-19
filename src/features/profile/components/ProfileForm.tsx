"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ImageIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import { getNameInitials } from "@/src/utils/getNameInitials";
import {
  profileFormSchema,
  ProfileFormValues,
} from "../schemas/profile.schemas";
import { NutritionistProfile } from "../types/profile.types";

interface ProfileFormProps {
  profile: NutritionistProfile;
  onSubmit: (
    values: ProfileFormValues,
    imagemPerfil?: File,
    imagemCapa?: File,
  ) => void | Promise<void>;
}

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PROFILE_IMAGE_SIZE = 1 * 1024 * 1024;
const MAX_COVER_IMAGE_SIZE = 2 * 1024 * 1024;

function formatImageSizeLimit(maxSize: number) {
  return maxSize / (1024 * 1024);
}

function validateImageFile(file: File, maxSize: number, imageLabel: string) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return "Use uma imagem JPG, PNG ou WebP.";
  }

  if (file.size > maxSize) {
    return `${imageLabel} deve ter ate ${formatImageSizeLimit(maxSize)} MB.`;
  }

  return null;
}

export default function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const [selectedProfileImageFile, setSelectedProfileImageFile] = useState<
    File | undefined
  >();
  const [selectedCoverImageFile, setSelectedCoverImageFile] = useState<
    File | undefined
  >();
  const [selectedProfileImagePreview, setSelectedProfileImagePreview] = useState<
    string | undefined
  >();
  const [selectedCoverImagePreview, setSelectedCoverImagePreview] = useState<
    string | undefined
  >();
  const [profileImageError, setProfileImageError] = useState<string | null>(
    null,
  );
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const profileImagePreview =
    selectedProfileImagePreview ?? profile.imagemPerfil ?? profile.fotoPerfil;
  const coverImagePreview = selectedCoverImagePreview ?? profile.imagemCapa;
  const fullName = `${profile.nome} ${profile.sobrenome}`.trim();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: profile.nome,
      sobrenome: profile.sobrenome,
      email: profile.email,
      dataNascimento: profile.dataNascimento,
      crn: profile.crn,
    },
  });
  const initials = getNameInitials(fullName);

  useEffect(() => {
    reset({
      nome: profile.nome,
      sobrenome: profile.sobrenome,
      email: profile.email,
      dataNascimento: profile.dataNascimento,
      crn: profile.crn,
    });
  }, [profile, reset]);

  useEffect(() => {
    return () => {
      if (selectedProfileImagePreview) {
        URL.revokeObjectURL(selectedProfileImagePreview);
      }
    };
  }, [selectedProfileImagePreview]);

  useEffect(() => {
    return () => {
      if (selectedCoverImagePreview) {
        URL.revokeObjectURL(selectedCoverImagePreview);
      }
    };
  }, [selectedCoverImagePreview]);

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setProfileImageError(null);

    if (!file) {
      return;
    }

    const error = validateImageFile(
      file,
      MAX_PROFILE_IMAGE_SIZE,
      "A foto de perfil",
    );

    if (error) {
      setProfileImageError(error);
      setSelectedProfileImageFile(undefined);
      setSelectedProfileImagePreview(undefined);
      event.target.value = "";
      return;
    }

    setSelectedProfileImageFile(file);
    setSelectedProfileImagePreview(URL.createObjectURL(file));
  };

  const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setCoverImageError(null);

    if (!file) {
      return;
    }

    const error = validateImageFile(
      file,
      MAX_COVER_IMAGE_SIZE,
      "A imagem de capa",
    );

    if (error) {
      setCoverImageError(error);
      setSelectedCoverImageFile(undefined);
      setSelectedCoverImagePreview(undefined);
      event.target.value = "";
      return;
    }

    setSelectedCoverImageFile(file);
    setSelectedCoverImagePreview(URL.createObjectURL(file));
  };

  const submitProfile = async (values: ProfileFormValues) => {
    await onSubmit(values, selectedProfileImageFile, selectedCoverImageFile);
    setSelectedProfileImageFile(undefined);
    setSelectedCoverImageFile(undefined);
    setSelectedProfileImagePreview(undefined);
    setSelectedCoverImagePreview(undefined);
  };

  return (
    <form
      onSubmit={handleSubmit(submitProfile)}
      className="grid grid-cols-1 gap-6"
    >
      <section className="overflow-hidden rounded-lg border border-border-default bg-surface-default shadow-sm">
        <div className="relative h-56 bg-surface-muted sm:h-64">
          {coverImagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImagePreview}
              alt="Imagem de capa"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-content-muted">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8" />
                <span className="text-body-small font-medium">
                  Imagem de capa
                </span>
              </div>
            </div>
          )}

          <div className="absolute right-4 top-4 flex max-w-[calc(100%-2rem)] flex-col items-end gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border-default bg-surface-default px-4 py-2 text-button font-semibold text-content-primary shadow-sm transition-colors hover:bg-surface-muted focus-within:outline-none focus-within:ring-2 focus-within:ring-action-secondary-focus">
              <Upload className="mr-2 h-4 w-4" />
              Escolher capa
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleCoverImageChange}
              />
            </label>
            {coverImageError && (
              <p className="max-w-xs rounded-md bg-feedback-error-bg px-3 py-2 text-right text-caption text-feedback-error-text shadow-sm">
                {coverImageError}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface-default bg-brand-100 text-heading-h2 font-bold text-action-primary shadow-sm">
                {profileImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImagePreview}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="pb-2">
                <h2 className="text-heading-h3 font-semibold text-content-primary">
                  {fullName || "Nutricionista"}
                </h2>
                <p className="text-body-small text-content-secondary">
                  {profile.crn
                    ? `${profile.profissao || "Nutricionista"} | ${profile.crn}`
                    : profile.profissao || "Nutricionista"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-action-secondary px-4 py-2 text-button font-semibold text-action-secondary-text transition-colors hover:bg-action-secondary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-action-secondary-focus">
                <Upload className="mr-2 h-4 w-4" />
                Escolher foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleProfileImageChange}
                />
              </label>
              {profileImageError && (
                <p className="max-w-xs text-right text-caption text-feedback-error-text">
                  {profileImageError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-border-default bg-surface-default p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-action-primary">
              <Camera className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-heading-h3 font-semibold text-content-primary">
                Dados profissionais
              </h2>
              <p className="text-body-small text-content-secondary">
                Esses dados aparecem no PDF do plano alimentar.
              </p>
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
              <Label htmlFor="profile_sobrenome">Sobrenome</Label>
              <Input
                id="profile_sobrenome"
                type="text"
                placeholder="Seu sobrenome"
                {...register("sobrenome")}
                error={errors.sobrenome?.message}
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

            <div className="space-y-2">
              <Label htmlFor="profile_email">E-mail</Label>
              <Input
                id="profile_email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_dataNascimento">Data de nascimento</Label>
              <Input
                id="profile_dataNascimento"
                type="date"
                {...register("dataNascimento")}
                error={errors.dataNascimento?.message}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
