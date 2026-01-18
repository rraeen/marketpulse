"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2, Check } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshAuth } = useAuth();
  const [isPremiumInterested, setIsPremiumInterested] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setIsPremiumInterested(user.isPremiumInterested || false);
    }
  }, [user]);

  const handleToggle = async (newValue: boolean) => {
    setIsPremiumInterested(newValue);
    setError("");
    setShowSuccess(false);
    setIsSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPremiumInterested: newValue }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update preference");
      }

      // Update was successful - show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Try to refresh auth, but don't fail if it errors
      try {
        await refreshAuth();
      } catch (refreshError) {
        // Log but don't show error to user since the save was successful
        console.warn("Failed to refresh auth state:", refreshError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preference. Please try again.");
      // Revert on error
      setIsPremiumInterested(!newValue);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 py-12 md:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          {/* Profile Info */}
          <div className="bg-background border border-border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Role</label>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Premium Interest Toggle */}
          <div className="bg-background border border-border rounded-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Premium Advisory Content
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Receive notifications about premium investment advisory services and
                  exclusive market insights. This helps us understand your interest in
                  advanced financial guidance.
                </p>

                {error && (
                  <div className="mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    {error}
                  </div>
                )}

                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Preference saved successfully
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Switch
                  checked={isPremiumInterested}
                  onCheckedChange={handleToggle}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
