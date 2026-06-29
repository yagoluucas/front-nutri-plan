"use client";

import { toast } from "sonner";
import { useLocalStore } from "@/src/features/local-store/LocalStoreProvider";
import ProfileForm from "@/src/features/profile/components/ProfileForm";
import { ProfileFormValues } from "@/src/features/profile/schemas/profile.schemas";

export default function MeuPerfilPage() {
    const { profile, updateProfile } = useLocalStore();

    const handleSubmit = (values: ProfileFormValues, fotoPerfil?: string) => {
        updateProfile(values, fotoPerfil);
        toast.success("Perfil atualizado nesta sessao.");
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
            <header className="space-y-2">
                <p className="text-caption font-semibold uppercase text-content-secondary">Conta</p>
                <h1 className="text-heading-h2 font-bold text-content-primary">Meu perfil</h1>
                <p className="max-w-3xl text-body-default text-content-secondary">
                    Mantenha sua identificacao profissional pronta para a emissao dos planos alimentares.
                </p>
            </header>

            <ProfileForm profile={profile} onSubmit={handleSubmit} />
        </div>
    );
}
