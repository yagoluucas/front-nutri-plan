"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  redirectToLogin,
  refreshSession,
} from "@/src/features/auth/services/session.service";

const REFRESH_INTERVAL_MS = 8 * 60 * 1_000;
const UNAVAILABLE_RETRY_MS = 30 * 1_000;
const PROTECTED_ROUTES = ["/dashboard", "/meu-perfil", "/pacientes", "/plano"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function SessionManager() {
  const pathname = usePathname();
  const protectedRoute = isProtectedRoute(pathname);

  useEffect(() => {
    if (!protectedRoute) {
      return;
    }

    let active = true;
    let retryTimeoutId: number | undefined;

    const renew = async () => {
      const result = await refreshSession();

      if (!active) {
        return;
      }

      if (result === "invalid") {
        redirectToLogin();
        return;
      }

      if (result === "unavailable") {
        retryTimeoutId = window.setTimeout(() => {
          void renew();
        }, UNAVAILABLE_RETRY_MS);
      }
    };

    void renew();

    const intervalId = window.setInterval(() => {
      void renew();
    }, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void renew();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);

      if (retryTimeoutId !== undefined) {
        window.clearTimeout(retryTimeoutId);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [protectedRoute]);

  return null;
}
