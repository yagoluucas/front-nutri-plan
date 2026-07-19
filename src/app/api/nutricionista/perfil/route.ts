import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_API_URL,
  applyAuthenticationState,
  clearAuthCookies,
  fetchAuthenticatedUpstream,
  readResponseBody,
  sanitizeAuthPayload,
} from "@/src/app/api/auth/_utils";
import { profileUpdateApiSchema } from "@/src/features/profile/schemas/profile.schemas";

const TEXT_PROFILE_FIELDS = [
  "nome",
  "sobrenome",
  "email",
  "dataNascimento",
  "crn",
] as const;
const FORM_PROFILE_FIELDS = new Set([
  ...TEXT_PROFILE_FIELDS,
  "alimentosFavoritos",
  "imagemPerfil",
  "imagemCapa",
]);
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PROFILE_IMAGE_SIZE = 1 * 1024 * 1024;
const MAX_COVER_IMAGE_SIZE = 2 * 1024 * 1024;

type StringFieldValidation = {
  value?: string;
  error?: string;
};

type FavoriteFoodsFieldValidation = {
  value?: unknown;
  error?: string;
};

type ImageFileValidation = {
  file?: File;
  error?: string;
};

function invalidProfileResponse(message = "Dados do perfil invalidos.") {
  return NextResponse.json(
    { message, error: true, statusCode: 400 },
    { status: 400 },
  );
}

async function toNextResponse(
  result: Awaited<ReturnType<typeof fetchAuthenticatedUpstream>>,
) {
  const payload = await readResponseBody(result.upstreamResponse);
  const response = NextResponse.json(sanitizeAuthPayload(payload), {
    status: result.upstreamResponse.status,
  });

  return applyAuthenticationState(response, result);
}

function validateStringField(
  value: FormDataEntryValue | null,
): StringFieldValidation {
  if (value === null) {
    return { value: undefined };
  }

  if (typeof value !== "string") {
    return { error: "Dados do perfil invalidos." };
  }

  return { value };
}

function validateFavoriteFoodsField(
  value: FormDataEntryValue | null,
): FavoriteFoodsFieldValidation {
  const stringField = validateStringField(value);

  if (stringField.error || stringField.value === undefined) {
    return stringField;
  }

  try {
    return { value: JSON.parse(stringField.value) };
  } catch {
    return { error: "Alimentos favoritos invalidos." };
  }
}

function validateImageFile(
  value: FormDataEntryValue | null,
  maxSize: number,
  imageLabel: string,
): ImageFileValidation {
  if (value === null) {
    return { file: undefined };
  }

  if (!(value instanceof File) || value.size === 0) {
    return { error: "Imagem invalida. Use JPG, PNG ou WebP." };
  }

  if (!ACCEPTED_IMAGE_TYPES.has(value.type)) {
    return { error: "Imagem invalida. Use JPG, PNG ou WebP." };
  }

  if (value.size > maxSize) {
    const maxSizeInMb = maxSize / (1024 * 1024);
    return { error: `${imageLabel} muito grande. Limite de ${maxSizeInMb} MB.` };
  }

  return { file: value };
}

async function parseMultipartProfileRequest(request: NextRequest) {
  const formData = await request.formData();
  const unexpectedField = Array.from(formData.keys()).find(
    (key) => !FORM_PROFILE_FIELDS.has(key),
  );

  if (unexpectedField) {
    return { error: "Dados do perfil invalidos." };
  }

  const requestBody: Record<string, unknown> = {};

  for (const fieldName of TEXT_PROFILE_FIELDS) {
    const field = validateStringField(formData.get(fieldName));

    if (field.error) {
      return { error: field.error };
    }

    if (field.value !== undefined) {
      requestBody[fieldName] = field.value;
    }
  }

  const favoriteFoods = validateFavoriteFoodsField(
    formData.get("alimentosFavoritos"),
  );

  if (favoriteFoods.error) {
    return { error: favoriteFoods.error };
  }

  if (favoriteFoods.value !== undefined) {
    requestBody.alimentosFavoritos = favoriteFoods.value;
  }

  const profileImage = validateImageFile(
    formData.get("imagemPerfil"),
    MAX_PROFILE_IMAGE_SIZE,
    "Foto de perfil",
  );

  if (profileImage.error) {
    return { error: profileImage.error };
  }

  const coverImage = validateImageFile(
    formData.get("imagemCapa"),
    MAX_COVER_IMAGE_SIZE,
    "Imagem de capa",
  );

  if (coverImage.error) {
    return { error: coverImage.error };
  }

  const parsedBody = profileUpdateApiSchema.safeParse(requestBody);

  if (!parsedBody.success) {
    return {
      error:
        parsedBody.error.issues[0]?.message || "Dados do perfil invalidos.",
    };
  }

  const upstreamFormData = new FormData();

  for (const [fieldName, value] of Object.entries(parsedBody.data)) {
    if (value === undefined) {
      continue;
    }

    upstreamFormData.append(
      fieldName,
      fieldName === "alimentosFavoritos" ? JSON.stringify(value) : String(value),
    );
  }

  if (profileImage.file) {
    upstreamFormData.append(
      "imagemPerfil",
      profileImage.file,
      profileImage.file.name,
    );
  }

  if (coverImage.file) {
    upstreamFormData.append("imagemCapa", coverImage.file, coverImage.file.name);
  }

  return { body: upstreamFormData };
}

export async function GET(request: NextRequest) {
  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/nutricionista/perfil", AUTH_API_URL),
      { method: "GET" },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao buscar perfil do nutricionista:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel buscar o perfil.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.toLowerCase().includes("multipart/form-data")) {
    try {
      const parsedRequest = await parseMultipartProfileRequest(request);

      if (parsedRequest.error || !parsedRequest.body) {
        return invalidProfileResponse(parsedRequest.error);
      }

      const result = await fetchAuthenticatedUpstream(
        request,
        new URL("/nutricionista", AUTH_API_URL),
        {
          method: "PATCH",
          body: parsedRequest.body,
        },
      );

      return toNextResponse(result);
    } catch (error) {
      console.error("Erro ao atualizar perfil do nutricionista:", error);

      return NextResponse.json(
        {
          message: "Nao foi possivel atualizar o perfil.",
          error: true,
          statusCode: 502,
        },
        { status: 502 },
      );
    }
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return invalidProfileResponse();
  }

  const parsedBody = profileUpdateApiSchema.safeParse(requestBody);

  if (!parsedBody.success) {
    return invalidProfileResponse(
      parsedBody.error.issues[0]?.message || "Dados do perfil invalidos.",
    );
  }

  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/nutricionista", AUTH_API_URL),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedBody.data),
      },
    );

    return toNextResponse(result);
  } catch (error) {
    console.error("Erro ao atualizar perfil do nutricionista:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel atualizar o perfil.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await fetchAuthenticatedUpstream(
      request,
      new URL("/nutricionista", AUTH_API_URL),
      { method: "DELETE" },
    );
    const payload = await readResponseBody(result.upstreamResponse);
    const response = NextResponse.json(sanitizeAuthPayload(payload), {
      status: result.upstreamResponse.status,
    });

    applyAuthenticationState(response, result);

    if (result.upstreamResponse.ok) {
      clearAuthCookies(response);
    }

    return response;
  } catch (error) {
    console.error("Erro ao excluir perfil do nutricionista:", error);

    return NextResponse.json(
      {
        message: "Nao foi possivel excluir o perfil.",
        error: true,
        statusCode: 502,
      },
      { status: 502 },
    );
  }
}
