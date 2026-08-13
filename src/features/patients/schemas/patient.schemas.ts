import { z } from "zod";
import { dietPlanRecordSchema } from "../../diet-plan/schemas/dietPlan.schemas";

const optionalTrimmedString = (maxLength: number, message: string) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(maxLength, message).optional(),
  );

const optionalEmail = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .trim()
    .email("E-mail invalido.")
    .max(100, "E-mail muito longo.")
    .optional(),
);

const optionalBirthDate = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.")
    .refine(
      (value) => value <= getBirthdayMaximumValue(),
      "A data de nascimento deve ser de pelo menos 6 meses atras.",
    )
    .optional(),
);

function formatDate(month: number, day: number) {
  const monthFormated = String(month).padStart(2, "0");
  const dayFormated = String(day).padStart(2, "0");

  return {
    monthFormated,
    dayFormated,
  };
}

export function getTodayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const { monthFormated, dayFormated } = formatDate(month, day);

  return `${year}-${monthFormated}-${dayFormated}`;
}

export function getBirthdayMaximumValue() {
  const today = new Date();
  today.setMonth(today.getMonth() - 6);

  const year = today.getFullYear();
  const { monthFormated, dayFormated } = formatDate(
    today.getMonth() + 1,
    today.getDate(),
  );

  return `${year}-${monthFormated}-${dayFormated}`;
}

const optionalFutureOrCurrentDate = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.")
    .refine(
      (value) => value >= getTodayDateInputValue(),
      "A data de entrega nao pode estar no passado.",
    )
    .optional(),
);

export const firstPlanDeliveryDateSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.")
    .optional(),
);

export const patientFormSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome do paciente.")
      .max(50, "Nome muito longo."),
    sobrenome: z
      .string()
      .trim()
      .min(2, "Informe o sobrenome do paciente.")
      .max(50, "Sobrenome muito longo."),
    email: optionalEmail,
    dataNascimento: optionalBirthDate,
    dataEntregaPrimeiroPlano: optionalFutureOrCurrentDate,
    sexo: z.enum(["Masculino", "Feminino", "Outro"], {
      message: "Selecione o sexo do paciente.",
    }),
    observacoes: optionalTrimmedString(1000, "Observacoes muito longas."),
  })
  .strict();

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const firstPlanDeliveryStatusSchema = z
  .object({
    primeiroPlanoEntregue: z.boolean(),
  })
  .strict();

export type FirstPlanDeliveryStatus = z.infer<
  typeof firstPlanDeliveryStatusSchema
>;

export const patientUpdateRequestSchema = z.union([
  patientFormSchema,
  firstPlanDeliveryStatusSchema,
]);

export const patientSummarySchema = z.object({
  id: z.string().trim().min(1),
  nome: z.string().trim().min(1),
  sobrenome: z.string().trim().min(1),
  email: z.string().optional(),
  dataNascimento: patientFormSchema.shape.dataNascimento,
  dataEntregaPrimeiroPlano: firstPlanDeliveryDateSchema,
  primeiroPlanoEntregue: z.boolean(),
  qtdPlanos: z.number().int().min(0),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export const patientSchema = patientFormSchema.extend({
  id: z.string().trim().min(1),
  idNutricionista: z.string().trim().min(1),
  primeiroPlanoEntregue: z.boolean(),
  qtdPlanos: z.number().int().min(0),
  planosAlimentares: z.array(dietPlanRecordSchema),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});
