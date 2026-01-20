"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isPremiumInterested: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    // Prevent indefinite "stuck" loaders if the request hangs (mobile networks, adblockers, etc.)
    const controller = new AbortController();
    const timeoutMs = 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/session", { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, isLoading, logout, refreshAuth: checkAuth };
}
