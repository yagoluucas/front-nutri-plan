import { IDietPlanState } from "../../diet-plan/types/dietPlan.types";
import { PatientFormValues } from "../schemas/patient.schemas";

export interface DietPlanRecord extends IDietPlanState {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface Patient extends PatientFormValues {
    id: string;
    planosAlimentares: DietPlanRecord[];
    createdAt: string;
    updatedAt: string;
}

