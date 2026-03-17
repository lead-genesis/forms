import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a safe, generic error message for client consumption.
 * Logs the full error server-side for debugging.
 */
export function safeError(error: { message?: string } | null, fallback = "An unexpected error occurred"): string {
  if (!error?.message) return fallback;
  // Only pass through well-known, safe messages
  const safe = [
    "Unauthorized",
    "Not found",
    "Lead not found",
    "Invalid verification code",
    "Too many verification attempts",
  ];
  if (safe.some(s => error.message!.includes(s))) return error.message!;
  return fallback;
}
