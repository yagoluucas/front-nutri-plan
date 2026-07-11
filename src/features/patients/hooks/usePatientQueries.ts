"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/queryKeys";
import { getPatientApi, listPatientsApi } from "../services/patient.service";

export function usePatientsQuery() {
  return useQuery({
    queryKey: queryKeys.patients.list,
    queryFn: listPatientsApi,
  });
}

export function usePatientQuery(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(patientId),
    queryFn: () => getPatientApi(patientId),
    enabled: Boolean(patientId),
  });
}
