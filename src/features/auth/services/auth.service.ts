import { DEFAULT_AUTH_REDIRECT } from "../constants";
import type { ZodType } from "zod";
import {
    authResponseSchema,
    confirmedRegistrationResponseSchema,
    ConfirmRegistrationValues,
    LoginFormValues,
    pendingRegistrationResponseSchema,
    RegisterFormValues,
    ResendRegistrationValues,
    type AuthResponse,
    type ConfirmedRegistrationResponse,
    type PendingRegistrationResponse,
} from "../schemas/auth.schemas";

export class AuthRequestError extends Error {
    readonly status: number;
    readonly retryAfterSeconds?: number;

    constructor(message: string, status: number, retryAfterSeconds?: number) {
        super(message);
        this.name = "AuthRequestError";
        this.status = status;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

interface AuthRequestResult {
    payload: AuthResponse;
    retryAfterSeconds?: number;
}

function parseRetryAfterSeconds(value: string | null): number | undefined {
    if (!value) {
        return undefined;
    }

    const trimmedValue = value.trim();
    const numericValue = Number(trimmedValue);

    if (Number.isInteger(numericValue) && numericValue >= 0) {
        return numericValue;
    }

    const dateValue = Date.parse(trimmedValue);

    if (Number.isNaN(dateValue)) {
        return undefined;
    }

    return Math.max(0, Math.ceil((dateValue - Date.now()) / 1000));
}

function parseRateLimitResetSeconds(value: string | null): number | undefined {
    if (!value) {
        return undefined;
    }

    const numericValue = Number(value.trim());

    if (!Number.isInteger(numericValue) || numericValue < 0) {
        return undefined;
    }

    const currentUnixTime = Math.floor(Date.now() / 1000);

    return numericValue >= currentUnixTime
        ? Math.max(0, numericValue - currentUnixTime)
        : numericValue;
}

function getRetryAfterSeconds(response: Response) {
    return parseRetryAfterSeconds(response.headers.get("Retry-After"))
        ?? parseRateLimitResetSeconds(response.headers.get("RateLimit-Reset"));
}

async function requestAuth(
    endpoint: "login" | "register" | "register/confirm" | "register/resend",
    data: LoginFormValues | RegisterFormValues | ConfirmRegistrationValues | ResendRegistrationValues,
): Promise<AuthRequestResult> {
    const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
    });
    const payload: unknown = await response.json().catch(() => null);
    const parsedResponse = authResponseSchema.safeParse(payload);
    const responseData = parsedResponse.success ? parsedResponse.data : null;

    if (!response.ok) {
        throw new AuthRequestError(
            responseData?.message || "Erro ao autenticar",
            response.status,
            getRetryAfterSeconds(response),
        );
    }

    return {
        payload: responseData || {},
        retryAfterSeconds: getRetryAfterSeconds(response),
    };
}

export async function loginApi(data: LoginFormValues) {
    const response = await requestAuth("login", data);
    return response.payload;
}

export async function registerApi(data: RegisterFormValues) {
    const response = await requestAuth("register", data);
    return parseSuccessfulAuthResponse(response.payload, pendingRegistrationResponseSchema);
}

function parseSuccessfulAuthResponse<T>(
    response: AuthResponse,
    schema: ZodType<T>,
): T {
    const parsedResponse = schema.safeParse(response);

    if (!parsedResponse.success) {
        throw new Error("Resposta inválida do servidor de autenticação.");
    }

    return parsedResponse.data;
}

export async function confirmRegistrationApi(
    data: ConfirmRegistrationValues,
): Promise<ConfirmedRegistrationResponse> {
    const response = await requestAuth("register/confirm", data);
    return parseSuccessfulAuthResponse(response.payload, confirmedRegistrationResponseSchema);
}

export async function resendRegistrationApi(
    data: ResendRegistrationValues,
): Promise<{ response: PendingRegistrationResponse; retryAfterSeconds?: number }> {
    const response = await requestAuth("register/resend", data);
    return {
        response: parseSuccessfulAuthResponse(response.payload, pendingRegistrationResponseSchema),
        retryAfterSeconds: response.retryAfterSeconds,
    };
}

export async function logoutApi() {
    await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
}

export function getPostAuthRedirectPath() {
    if (typeof window === "undefined") {
        return DEFAULT_AUTH_REDIRECT;
    }

    const redirectTo = new URLSearchParams(window.location.search).get("redirectTo");

    if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
        return DEFAULT_AUTH_REDIRECT;
    }

    return redirectTo;
}
