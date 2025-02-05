"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

async function refreshToken() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh-token`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { authState, login, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        if (!authState.accessToken) {
          const data = await refreshToken();
          if (data) {
            login(data.accessToken, data.user);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsChecking(false);
      }
    }

    initializeAuth();
  }, [authState.accessToken, login]);

  useEffect(() => {
    if (!authState.accessToken) return;

    const timeoutId = setTimeout(async () => {
      try {
        const data = await refreshToken();
        if (data) {
          login(data.accessToken, data.user);
        } else {
          logout();
          if (pathname !== "/authenticate") {
            router.replace("/authenticate");
          }
        }
      } catch (error) {
        console.error("Token refresh error:", error);
      }
    }, 14 * 60 * 1000);

    return () => clearTimeout(timeoutId);
  }, [authState.accessToken, login, logout, pathname, router]);

  useEffect(() => {
    if (isChecking) return;

    if (authState.accessToken) {
      if (pathname === "/authenticate") {
        router.replace("/chat");
      }
    } else {
      if (pathname !== "/authenticate") {
        router.replace("/authenticate");
      }
    }
  }, [authState.accessToken, isChecking, pathname, router]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
