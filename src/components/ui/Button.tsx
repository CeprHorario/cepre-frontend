import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "navy" | "secondary" | "ghost" | "danger" | "danger-solid";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-guinda-700 text-white hover:bg-guinda-600",
  navy: "border-transparent bg-marino-900 text-white hover:bg-marino-700",
  secondary: "bg-white text-ink-900 border-field hover:border-marino-300 hover:bg-surface-2",
  ghost: "border-transparent bg-transparent text-guinda-700 hover:bg-guinda-50",
  danger: "bg-white text-danger-600 border-[#F1C2BD] hover:bg-danger-50",
  "danger-solid": "border-transparent bg-danger-600 text-white hover:bg-danger-700",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-[15px] gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-[10px] border font-semibold whitespace-nowrap transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none";

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, VARIANT[variant], SIZE[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, typeof className === "string" ? className : undefined)} {...props}>
      {icon}
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
  tone?: "default" | "dark" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", tone = "default", className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[10px] border transition-colors cursor-pointer disabled:opacity-50",
        size === "sm" ? "size-8" : "size-10",
        tone === "dark"
          ? "border-transparent bg-white/10 text-white hover:bg-white/20"
          : tone === "danger"
            ? "border-line bg-white text-danger-600 hover:border-danger-600 hover:bg-danger-50"
            : "border-line bg-white text-ink-700 hover:border-marino-300 hover:text-marino-900",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
