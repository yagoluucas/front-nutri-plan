import {
  favoriteFoodsSchema,
  profileApiSchema,
  profileFormSchema,
  type FavoriteFood,
  type ProfileFormValues,
} from "../schemas/profile.schemas";
import type { NutritionistProfile } from "../types/profile.types";
import { z } from "zod";
import { fetchWithSession } from "../../auth/services/session.service";

const profileResponseSchema = z.object({
  nutricionista: profileApiSchema,
});

function getPayloadMessage(payload: unknown, fallback: string) {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

async function requestProfileApi(
  endpoint: string,
  init?: RequestInit,
): Promise<unknown> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithSession(endpoint, {
    ...init,
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getPayloadMessage(payload, "Nao foi possivel concluir a requisicao."),
    );
  }

  return payload;
}

function toDateInputValue(value: string) {
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return dateOnly || "";
}

function toProfile(
  profile: z.infer<typeof profileApiSchema>,
): NutritionistProfile {
  return {
    ...profile,
    dataNascimento: toDateInputValue(profile.dataNascimento),
    profissao: "Nutricionista",
    fotoPerfil: profile.imagemPerfil,
  };
}

function parseProfilePayload(
  payload: unknown,
  fallbackMessage: string,
): NutritionistProfile {
  const parsedResponse = profileResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    throw new Error(fallbackMessage);
  }

  return toProfile(parsedResponse.data.nutricionista);
}

export async function getProfileApi(): Promise<NutritionistProfile> {
  const payload = await requestProfileApi("/api/nutricionista/perfil", {
    method: "GET",
  });

  return parseProfilePayload(payload, "Resposta invalida ao buscar perfil.");
}

export async function updateProfileApi(
  values: ProfileFormValues,
  imagemPerfil?: string,
  imagemCapa?: string,
  alimentosFavoritos?: FavoriteFood[],
): Promise<NutritionistProfile> {
  const parsedValues = profileFormSchema.parse(values);
  const parsedFavoriteFoods =
    alimentosFavoritos === undefined
      ? undefined
      : favoriteFoodsSchema.parse(alimentosFavoritos);
  const payload = await requestProfileApi("/api/nutricionista/perfil", {
    method: "PATCH",
    body: JSON.stringify({
      ...parsedValues,
      imagemPerfil,
      imagemCapa,
      alimentosFavoritos: parsedFavoriteFoods,
    }),
  });

  return parseProfilePayload(payload, "Resposta invalida ao atualizar perfil.");
}

export async function updateFavoriteFoodsApi(
  profile: NutritionistProfile,
  alimentosFavoritos: FavoriteFood[],
): Promise<NutritionistProfile> {
  const parsedValues = profileFormSchema.parse({
    nome: profile.nome,
    sobrenome: profile.sobrenome,
    email: profile.email,
    dataNascimento: profile.dataNascimento,
    crn: profile.crn,
  });
  const parsedFavoriteFoods = favoriteFoodsSchema.parse(alimentosFavoritos);
  const payload = await requestProfileApi("/api/nutricionista/perfil", {
    method: "PATCH",
    body: JSON.stringify({
      ...parsedValues,
      imagemPerfil: profile.imagemPerfil ?? profile.fotoPerfil,
      imagemCapa: profile.imagemCapa,
      alimentosFavoritos: parsedFavoriteFoods,
    }),
  });

  return parseProfilePayload(payload, "Resposta invalida ao atualizar favoritos.");
}

export async function deleteProfileApi(): Promise<void> {
  await requestProfileApi("/api/nutricionista/perfil", {
    method: "DELETE",
  });
}
