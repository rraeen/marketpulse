import {
  ButtonHTMLAttributes,
  forwardRef,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const composedClassName = cn(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
      "disabled:opacity-50 disabled:pointer-events-none",
      {
        "bg-foreground text-background hover:opacity-90 active:scale-[0.98]":
          variant === "default",
        "border border-border bg-background hover:bg-accent hover:border-foreground/20":
          variant === "outline",
        "hover:bg-accent": variant === "ghost",
        "h-10 px-4 py-2 text-sm": size === "default",
        "h-9 px-3 text-sm": size === "sm",
        "h-12 px-6 text-base": size === "lg",
      },
      className
    );

    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error("Button with `asChild` expects a single React element child.");
      }

      const child = children as ReactElement<{ className?: string; "aria-disabled"?: boolean }>;
      return cloneElement(child, {
        className: cn(composedClassName, child.props.className),
        "aria-disabled": disabled || isLoading ? true : child.props["aria-disabled"],
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={composedClassName}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
