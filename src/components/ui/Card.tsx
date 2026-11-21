import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warm" | "outlined" | "interactive";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      "bg-white border border-sahay-warm-200/80 shadow-card text-sahay-navy-950",
    warm:
      "bg-sahay-warm-100 border border-sahay-warm-200 shadow-sm text-sahay-navy-950",
    outlined:
      "bg-white border-2 border-sahay-navy-900/15 shadow-none text-sahay-navy-950",
    interactive:
      "bg-white border border-sahay-warm-300 shadow-card hover:shadow-card-hover hover:border-sahay-navy-600 transition-all cursor-pointer text-sahay-navy-950",
  };

  return (
    <div
      className={cn("rounded-2xl p-5 md:p-6", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl font-bold tracking-tight text-sahay-navy-950 leading-snug",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-base text-sahay-warm-800 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-sahay-warm-200/60", className)}
      {...props}
    >
      {children}
    </div>
  );
}
