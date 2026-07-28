import { DEFAULT_AUTH_REDIRECT } from "../constants";
import {
    authResponseSchema,
    LoginFormValues,
    RegisterFormValues,
    type AuthResponse,
} from "../schemas/auth.schemas";

async function requestAuth(
    endpoint: "login" | "register",
    data: LoginFormValues | RegisterFormValues,
): Promise<AuthResponse> {
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
        throw new Error(responseData?.message || "Erro ao autenticar");
    }

    return responseData || {};
}

export async function loginApi(data: LoginFormValues) {
    return requestAuth("login", data);
}

export async function registerApi(data: RegisterFormValues) {
    return requestAuth("register", data);
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
