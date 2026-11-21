import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "navy"
    | "subtle";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-sahay-navy-100 text-sahay-navy-900 border-sahay-navy-200",
    success: "bg-sahay-green-100 text-sahay-green-900 border-sahay-green-200",
    warning: "bg-amber-100 text-amber-900 border-amber-200",
    danger: "bg-red-100 text-red-900 border-red-200",
    navy: "bg-sahay-navy-900 text-white border-transparent",
    subtle: "bg-sahay-warm-200 text-sahay-warm-900 border-sahay-warm-300",
    outline: "bg-transparent text-sahay-navy-900 border-sahay-navy-300",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3 py-1 text-sm font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
