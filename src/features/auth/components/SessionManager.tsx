"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_AUTH_REDIRECT, LOGIN_ROUTE } from "../constants";
import { queryKeys } from "@/src/lib/queryKeys";
import { useProfile } from "@/src/features/profile/ProfileProvider";
import { getProfileApi } from "@/src/features/profile/services/profile.service";
import {
  registerSessionValidator,
  revalidateSessionIdentity,
  subscribeToLogout,
} from "@/src/features/auth/services/session.service";

const SESSION_VALIDATION_TIMEOUT_MS = 20_000;

async function getProfileWithTimeout() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, SESSION_VALIDATION_TIMEOUT_MS);

  try {
    return await getProfileApi(controller.signal);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function SessionManager({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const displayedUserIdRef = useRef<string | null>(null);
  const profileIdRef = useRef(profile.id);
  const invalidatedRef = useRef(false);
  const activeRef = useRef(true);
  const [sessionIsBlocked, setSessionIsBlocked] = useState(false);

  const clearRenderedSession = useCallback(() => {
    invalidatedRef.current = true;
    displayedUserIdRef.current = null;
    setSessionIsBlocked(true);
    queryClient.clear();
  }, [queryClient]);

  const handleLogout = useCallback(() => {
    clearRenderedSession();
    router.replace(LOGIN_ROUTE);
    router.refresh();
  }, [clearRenderedSession, router]);

  const validateIdentity = useCallback(async () => {
    const displayedUserId = displayedUserIdRef.current
      || profileIdRef.current
      || null;

    try {
      const currentProfile = await getProfileWithTimeout();

      if (!activeRef.current || invalidatedRef.current) {
        return false;
      }

      if (displayedUserId && displayedUserId !== currentProfile.id) {
        clearRenderedSession();
        window.location.replace(DEFAULT_AUTH_REDIRECT);
        return false;
      }

      displayedUserIdRef.current = currentProfile.id;
      queryClient.setQueryData(queryKeys.profile, currentProfile);
      return true;
    } catch {
      return false;
    }
  }, [clearRenderedSession, queryClient]);

  const revalidateActiveSession = useCallback(() => {
    if (invalidatedRef.current) {
      return;
    }

    void revalidateSessionIdentity();
  }, []);

  useEffect(() => {
    profileIdRef.current = profile.id;

    if (profile.id && !displayedUserIdRef.current) {
      displayedUserIdRef.current = profile.id;
    }
  }, [profile.id]);

  useEffect(() => {
    activeRef.current = true;
    const unregisterValidator = registerSessionValidator(validateIdentity);
    const unsubscribeFromLogout = subscribeToLogout(handleLogout);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        revalidateActiveSession();
      }
    };

    const handlePageShow = () => revalidateActiveSession();

    window.addEventListener("focus", revalidateActiveSession);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      activeRef.current = false;
      unregisterValidator();
      unsubscribeFromLogout();
      window.removeEventListener("focus", revalidateActiveSession);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleLogout, revalidateActiveSession, validateIdentity]);

  return sessionIsBlocked ? null : children;
}
