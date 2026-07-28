import { z } from "zod";
import { dietPlanRecordSchema } from "../../diet-plan/schemas/dietPlan.schemas";
import { patientSchema, patientSummarySchema } from "../schemas/patient.schemas";

export type DietPlanRecord = z.infer<typeof dietPlanRecordSchema>;
export type PatientSummary = z.infer<typeof patientSummarySchema>;
export type Patient = z.infer<typeof patientSchema>;
