"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/src/components/ui/Button";
import { LOGIN_ROUTE } from "@/src/features/auth/constants";
import { useProfile } from "@/src/features/profile/ProfileProvider";
import ProfileForm from "@/src/features/profile/components/ProfileForm";
import { ProfileFormValues } from "@/src/features/profile/schemas/profile.schemas";
import { deleteProfileApi, getProfileApi, updateProfileApi } from "@/src/features/profile/services/profile.service";
import type { NutritionistProfile } from "@/src/features/profile/types/profile.types";

export default function MeuPerfilPage() {
    const router = useRouter();
    const { syncProfile } = useProfile();
    const [profile, setProfile] = useState<NutritionistProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        let isActive = true;

        async function loadProfile() {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const loadedProfile = await getProfileApi();

                if (isActive) {
                    setProfile(loadedProfile);
                    syncProfile(loadedProfile);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel buscar o perfil.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            isActive = false;
        };
    }, [syncProfile]);

    const handleSubmit = async (values: ProfileFormValues, imagemPerfil?: string, imagemCapa?: string) => {
        try {
            const updatedProfile = await updateProfileApi(values, imagemPerfil, imagemCapa);
            setProfile(updatedProfile);
            syncProfile(updatedProfile);
            toast.success("Perfil atualizado com sucesso.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Nao foi possivel atualizar o perfil.");
        }
    };

    const handleDeleteProfile = async () => {
        try {
            setIsDeleting(true);
            await deleteProfileApi();
            toast.success("Perfil excluido com sucesso.");
            router.replace(LOGIN_ROUTE);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Nao foi possivel excluir o perfil.");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <p className="text-caption font-semibold uppercase text-content-secondary">Conta</p>
                    <h1 className="text-heading-h2 font-bold text-content-primary">Meu perfil</h1>
                    <p className="max-w-3xl text-body-default text-content-secondary">
                        Mantenha sua identificacao profissional pronta para a emissao dos planos alimentares.
                    </p>
                </div>

                {profile && (
                    <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir perfil
                    </Button>
                )}
            </header>

            {isLoading ? (
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Carregando perfil...</h2>
                    <p className="mt-2 text-body-default text-content-secondary">
                        Buscando seus dados profissionais.
                    </p>
                </section>
            ) : errorMessage || !profile ? (
                <section className="rounded-lg border border-border-default bg-surface-default p-10 text-center shadow-sm">
                    <h2 className="text-heading-h3 font-semibold text-content-primary">Nao foi possivel carregar o perfil</h2>
                    <p className="mt-2 text-body-default text-content-secondary">
                        {errorMessage || "Tente novamente em alguns instantes."}
                    </p>
                </section>
            ) : (
                <ProfileForm profile={profile} onSubmit={handleSubmit} />
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <section className="w-full max-w-md rounded-lg border border-border-default bg-surface-default p-6 shadow-lg">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-feedback-error-bg text-feedback-error-text">
                                    <AlertTriangle className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="text-heading-h3 font-semibold text-content-primary">Tem certeza?</h2>
                                    <p className="mt-2 text-body-small text-content-secondary">
                                        Ao excluir seu perfil, sua conta sera removida e voce perdera o acesso ao sistema.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="rounded-md p-1 text-content-secondary transition-colors hover:bg-surface-muted hover:text-content-primary"
                                onClick={() => setShowDeleteConfirm(false)}
                                aria-label="Fechar"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button type="button" variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                                Cancelar
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDeleteProfile} disabled={isDeleting}>
                                {isDeleting ? "Excluindo..." : "Sim, excluir perfil"}
                            </Button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
