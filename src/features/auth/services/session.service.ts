const REFRESH_RETRY_DELAY_MS = 250;

type RefreshResult = "refreshed" | "invalid" | "unavailable";

let refreshPromise: Promise<RefreshResult> | null = null;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestRefresh(attempt = 0): Promise<RefreshResult> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (response.ok) {
      return "refreshed";
    }

    if (response.status === 409 && attempt === 0) {
      await wait(REFRESH_RETRY_DELAY_MS);
      return requestRefresh(1);
    }

    if ([401, 403].includes(response.status)) {
      return "invalid";
    }

    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  const redirectTo = `${window.location.pathname}${window.location.search}`;
  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("sessionExpired", "1");
  loginUrl.searchParams.set("redirectTo", redirectTo);
  window.location.replace(loginUrl.toString());
}

export async function fetchWithSession(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const request = () =>
    fetch(input, {
      ...init,
      credentials: "include",
    });

  let response = await request();

  if (response.status !== 401) {
    return response;
  }

  const refreshResult = await refreshSession();

  if (refreshResult === "refreshed") {
    response = await request();

    if (response.status === 401) {
      redirectToLogin();
    }

    return response;
  }

  if (refreshResult === "invalid") {
    redirectToLogin();
  }

  return response;
}
