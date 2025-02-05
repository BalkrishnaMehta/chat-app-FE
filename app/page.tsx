"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState.accessToken) {
      router.replace("/chat");
    } else {
      router.replace("/authenticate");
    }
  }, [router, authState.accessToken]);

  return null;
}
