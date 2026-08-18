import { z } from "zod";

const AUTH_CHANNEL_NAME = "nutri-plan-auth";
const SESSION_INVALIDATED_EVENT = "nutri-plan-session-invalidated";
const SAFE_REQUEST_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const authChannelMessageSchema = z
  .object({ type: z.literal("logout") })
  .strict();

type SessionValidator = () => Promise<boolean>;
type ValidationRequest = {
  validator: SessionValidator;
  promise: Promise<boolean>;
};

let validationRequest: ValidationRequest | null = null;
let sessionValidator: SessionValidator | null = null;
let authChannel: BroadcastChannel | null = null;

function getAuthChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  authChannel ??= new BroadcastChannel(AUTH_CHANNEL_NAME);
  return authChannel;
}

function dispatchSessionInvalidated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
  }
}

export function notifyLogout() {
  getAuthChannel()?.postMessage({ type: "logout" });
  dispatchSessionInvalidated();
}

export function subscribeToLogout(onLogout: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const channel = getAuthChannel();
  const handleChannelMessage = (event: MessageEvent<unknown>) => {
    if (authChannelMessageSchema.safeParse(event.data).success) {
      onLogout();
    }
  };
  const handleLocalInvalidation = () => onLogout();

  channel?.addEventListener("message", handleChannelMessage);
  window.addEventListener(SESSION_INVALIDATED_EVENT, handleLocalInvalidation);

  return () => {
    channel?.removeEventListener("message", handleChannelMessage);
    window.removeEventListener(
      SESSION_INVALIDATED_EVENT,
      handleLocalInvalidation,
    );
  };
}

export function registerSessionValidator(validator: SessionValidator) {
  sessionValidator = validator;

  return () => {
    if (sessionValidator === validator) {
      sessionValidator = null;
    }
  };
}

export function revalidateSessionIdentity() {
  const validator = sessionValidator;

  if (!validator) {
    return Promise.resolve(false);
  }

  if (validationRequest?.validator === validator) {
    return validationRequest.promise;
  }

  const request: ValidationRequest = {
    validator,
    promise: validator(),
  };

  request.promise = request.promise.finally(() => {
    if (validationRequest === request) {
      validationRequest = null;
    }
  });
  validationRequest = request;

  return request.promise;
}

export async function fetchWithSession(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const method = (init?.method || "GET").toUpperCase();

  if (!SAFE_REQUEST_METHODS.has(method)) {
    const identityIsCurrent = await revalidateSessionIdentity();

    if (!identityIsCurrent) {
      throw new Error(
        "Nao foi possivel validar a sessao. Tente novamente.",
      );
    }
  }

  const response = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    notifyLogout();
  }

  return response;
}
