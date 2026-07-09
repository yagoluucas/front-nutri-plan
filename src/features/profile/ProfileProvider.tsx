"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { getProfileApi } from "./services/profile.service";
import type { NutritionistProfile } from "./types/profile.types";

interface ProfileContextValue {
    profile: NutritionistProfile;
    syncProfile: (profile: NutritionistProfile) => void;
}

const defaultProfile: NutritionistProfile = {
    nome: "",
    sobrenome: "",
    email: "",
    dataNascimento: "",
    profissao: "Nutricionista",
    crn: "",
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<NutritionistProfile>(defaultProfile);

    const syncProfile = useCallback((nextProfile: NutritionistProfile) => {
        setProfile(nextProfile);
    }, []);

    useEffect(() => {
        let isActive = true;

        async function loadProfile() {
            try {
                const loadedProfile = await getProfileApi();

                if (isActive) {
                    syncProfile(loadedProfile);
                }
            } catch {
                // Keep default profile when fetching is unavailable.
            }
        }

        loadProfile();

        return () => {
            isActive = false;
        };
    }, [syncProfile]);

    const value = useMemo<ProfileContextValue>(() => ({
        profile,
        syncProfile,
    }), [profile, syncProfile]);

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
