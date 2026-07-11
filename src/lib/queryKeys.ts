export const queryKeys = {
  profile: ["profile"] as const,
  patients: {
    list: ["patients", "list"] as const,
    detail: (patientId: string) => ["patients", "detail", patientId] as const,
  },
};
