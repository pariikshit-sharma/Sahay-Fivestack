import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "warm";
  size?: "sm" | "md" | "lg" | "touch";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sahay-navy-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none rounded-xl";

    const variants = {
      primary:
        "bg-sahay-navy-900 text-white hover:bg-sahay-navy-800 active:bg-sahay-navy-950 shadow-sm",
      secondary:
        "bg-sahay-warm-200 text-sahay-navy-950 hover:bg-sahay-warm-300 active:bg-sahay-warm-400 border border-sahay-warm-300",
      outline:
        "border-2 border-sahay-navy-800 text-sahay-navy-900 bg-transparent hover:bg-sahay-navy-50 active:bg-sahay-navy-100",
      ghost:
        "text-sahay-navy-800 hover:bg-sahay-warm-200/60 active:bg-sahay-warm-300",
      success:
        "bg-sahay-green-700 text-white hover:bg-sahay-green-800 active:bg-sahay-green-900 shadow-sm",
      warm:
        "bg-sahay-saffron-600 text-white hover:bg-sahay-saffron-700 active:bg-sahay-saffron-800 shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm min-h-[36px]",
      md: "h-11 px-5 text-base min-h-[44px]",
      lg: "h-12 px-6 text-lg min-h-[48px]",
      touch: "h-14 px-8 text-lg min-h-[56px] min-w-[56px] text-lg font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
