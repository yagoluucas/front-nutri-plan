"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { IDietPlanState } from "../diet-plan/types/dietPlan.types";
import { PatientFormValues, patientFormSchema } from "../patients/schemas/patient.schemas";
import { DietPlanRecord, Patient } from "../patients/types/patient.types";
import { profileFormSchema, ProfileFormValues } from "../profile/schemas/profile.schemas";
import { NutritionistProfile } from "../profile/types/profile.types";

interface LocalStoreContextValue {
    patients: Patient[];
    profile: NutritionistProfile;
    createPatient: (values: PatientFormValues) => Patient;
    updatePatient: (patientId: string, values: PatientFormValues) => void;
    deletePatient: (patientId: string) => void;
    getPatientById: (patientId: string) => Patient | undefined;
    upsertDietPlan: (patientId: string, plan: IDietPlanState) => DietPlanRecord | null;
    deleteDietPlan: (patientId: string, planId: string) => void;
    updateProfile: (values: ProfileFormValues, fotoPerfil?: string) => void;
}

const LocalStoreContext = createContext<LocalStoreContextValue | null>(null);

const defaultProfile: NutritionistProfile = {
    nome: "",
    profissao: "Nutricionista",
    crn: "",
};

function createId(prefix: string) {
    const randomId = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    return `${prefix}_${randomId}`;
}

function toDietPlanRecord(plan: IDietPlanState, existing?: DietPlanRecord): DietPlanRecord {
    const now = new Date().toISOString();

    return {
        ...plan,
        id: plan.id || existing?.id || createId("plan"),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    };
}

export function LocalStoreProvider({ children }: { children: ReactNode }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [profile, setProfile] = useState<NutritionistProfile>(defaultProfile);

    const value = useMemo<LocalStoreContextValue>(() => ({
        patients,
        profile,
        createPatient(values) {
            const parsedValues = patientFormSchema.parse(values);
            const now = new Date().toISOString();
            const patient: Patient = {
                ...parsedValues,
                id: createId("patient"),
                planosAlimentares: [],
                createdAt: now,
                updatedAt: now,
            };

            setPatients((currentPatients) => [patient, ...currentPatients]);
            return patient;
        },
        updatePatient(patientId, values) {
            const parsedValues = patientFormSchema.parse(values);
            setPatients((currentPatients) => currentPatients.map((patient) => {
                if (patient.id !== patientId) return patient;
                return {
                    ...patient,
                    ...parsedValues,
                    updatedAt: new Date().toISOString(),
                };
            }));
        },
        deletePatient(patientId) {
            setPatients((currentPatients) => currentPatients.filter((patient) => patient.id !== patientId));
        },
        getPatientById(patientId) {
            return patients.find((patient) => patient.id === patientId);
        },
        upsertDietPlan(patientId, plan) {
            const patient = patients.find((currentPatient) => currentPatient.id === patientId);

            if (!patient) {
                return null;
            }

            const existingPlan = plan.id
                ? patient.planosAlimentares.find((item) => item.id === plan.id)
                : patient.planosAlimentares[0];
            const savedPlan = toDietPlanRecord(plan, existingPlan);

            setPatients((currentPatients) => currentPatients.map((patient) => {
                if (patient.id !== patientId) {
                    return patient;
                }

                const hasExistingPlan = patient.planosAlimentares.some((item) => item.id === savedPlan.id);
                const nextPlans = hasExistingPlan
                    ? patient.planosAlimentares.map((item) => item.id === savedPlan.id ? savedPlan : item)
                    : [savedPlan, ...patient.planosAlimentares];

                return {
                    ...patient,
                    planosAlimentares: nextPlans,
                    updatedAt: savedPlan.updatedAt,
                };
            }));

            return savedPlan;
        },
        deleteDietPlan(patientId, planId) {
            setPatients((currentPatients) => currentPatients.map((patient) => {
                if (patient.id !== patientId) {
                    return patient;
                }

                return {
                    ...patient,
                    planosAlimentares: patient.planosAlimentares.filter((plan) => plan.id !== planId),
                    updatedAt: new Date().toISOString(),
                };
            }));
        },
        updateProfile(values, fotoPerfil) {
            const parsedValues = profileFormSchema.parse(values);
            setProfile((currentProfile) => ({
                ...currentProfile,
                ...parsedValues,
                fotoPerfil: fotoPerfil ?? currentProfile.fotoPerfil,
                updatedAt: new Date().toISOString(),
            }));
        },
    }), [patients, profile]);

    return (
        <LocalStoreContext.Provider value={value}>
            {children}
        </LocalStoreContext.Provider>
    );
}

export function useLocalStore() {
    const context = useContext(LocalStoreContext);

    if (!context) {
        throw new Error("useLocalStore deve ser usado dentro de LocalStoreProvider.");
    }

    return context;
}
