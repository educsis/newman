"use client";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl shadow-sky-900/10 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-900/10",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-slate-900",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-slate-600/90", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center justify-between border-t border-slate-100/70 pt-4",
        className
      )}
      {...props}
    />
  );
}
