"use client";

import { SelectHTMLAttributes, forwardRef, useMemo, Children, isValidElement } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  scrollable?: boolean; // Enable scrollable dropdown with fixed height (max 250px)
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, scrollable, ...props }, ref) => {

    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-2 text-sm bg-background border rounded-md appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-red-500 focus:ring-red-500/20" : "border-border",
              scrollable && "select-scrollable",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
