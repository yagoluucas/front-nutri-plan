import { IDietPlanState } from "../../diet-plan/types/dietPlan.types";
import { PatientFormValues } from "../schemas/patient.schemas";

export interface DietPlanRecord extends IDietPlanState {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface PatientSummary {
    id: string;
    nome: string;
    sobrenome: string;
    email?: string;
    sexo: PatientFormValues["sexo"];
    qtdPlanos: number;
    createdAt: string;
    updatedAt: string;
}

export interface Patient extends PatientFormValues {
    id: string;
    idNutricionista: string;
    planosAlimentares: DietPlanRecord[];
    createdAt: string;
    updatedAt: string;
}
