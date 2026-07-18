"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/queryKeys";
import { getProfileApi } from "./services/profile.service";
import type { NutritionistProfile } from "./types/profile.types";

interface ProfileContextValue {
    profile: NutritionistProfile;
    isLoading: boolean;
    errorMessage: string | null;
    syncProfile: (profile: NutritionistProfile) => void;
    refetchProfile: () => Promise<void>;
}

const defaultProfile: NutritionistProfile = {
    id: "",
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    profissao: "Nutricionista",
    crn: "",
    alimentosFavoritos: [],
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const {
        data,
        error,
        isPending,
        refetch,
    } = useQuery({
        queryKey: queryKeys.profile,
        queryFn: getProfileApi,
    });

    const syncProfile = useCallback((nextProfile: NutritionistProfile) => {
        queryClient.setQueryData(queryKeys.profile, nextProfile);
    }, [queryClient]);

    const refetchProfile = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const errorMessage = !data && error instanceof Error
        ? error.message
        : !data && error
            ? "Nao foi possivel buscar o perfil."
            : null;

    const value = useMemo<ProfileContextValue>(() => ({
        profile: data ?? defaultProfile,
        isLoading: isPending,
        errorMessage,
        syncProfile,
        refetchProfile,
    }), [data, errorMessage, isPending, refetchProfile, syncProfile]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);

    if (!context) {
        throw new Error("useProfile deve ser usado dentro de ProfileProvider.");
    }

    return context;
}
