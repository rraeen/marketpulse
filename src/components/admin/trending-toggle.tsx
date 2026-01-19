"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast";
import { fetchWithCsrf } from "@/lib/utils/fetch-with-csrf";

interface TrendingToggleProps {
  postId: string;
  isTrending: boolean;
  onToggle?: (postId: string, newValue: boolean) => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TrendingToggle({
  postId,
  isTrending: initialIsTrending,
  onToggle,
  size = "md",
  showLabel = false,
}: TrendingToggleProps) {
  const { success, error: showError } = useToast();
  const [isTrending, setIsTrending] = useState(initialIsTrending);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newValue = !isTrending;

    // Optimistic update
    setIsTrending(newValue);

    try {
      const response = await fetchWithCsrf(`/api/admin/posts/${postId}/trending`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrending: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update trending status");
      }

      onToggle?.(postId, newValue);
      success(newValue ? "Post marked as trending" : "Post removed from trending");
    } catch (error) {
      // Rollback on error
      setIsTrending(isTrending);
      console.error("Error toggling trending:", error);
      showError("Failed to update trending status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-1.5 transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 rounded"
      )}
      aria-label={isTrending ? "Remove from trending" : "Mark as trending"}
      title={isTrending ? "Trending" : "Mark as Trending"}
    >
      {isLoading ? (
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-muted-foreground")} />
      ) : isTrending ? (
        <Star
          className={cn(
            sizeClasses[size],
            "fill-yellow-400 text-yellow-400",
            "drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]",
            "animate-pulse"
          )}
        />
      ) : (
        <Star
          className={cn(
            sizeClasses[size],
            "text-muted-foreground opacity-60",
            "hover:opacity-100 hover:text-yellow-400"
          )}
        />
      )}
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {isTrending ? "Trending" : "Mark as Trending"}
        </span>
      )}
    </button>
  );
}
