import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "outline-danger" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "secondary" && "btn-secondary",
          variant === "danger" && "btn-danger",
          variant === "outline" && "btn-outline",
          variant === "outline-danger" && "btn-outline-danger",
          variant === "ghost" && "btn-ghost",
          variant === "icon" && "btn-icon",
          size === "sm" && "px-2 py-1 text-xs", // Optional overrides if needed
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
