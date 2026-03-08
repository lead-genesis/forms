/**
 * Production-grade validation utilities for form inputs.
 */

/**
 * Validates an email address using a standard regex.
 */
export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates a phone number.
 * Basic version: at least 8 digits, allow +, -, spaces, parens.
 */
export const validatePhone = (phone: string): boolean => {
    return /^[\d\+\-\s\(\)]{8,}$/.test(phone);
};

/**
 * Checks if a value is present (not null/undefined) and not empty if it's a string.
 */
export const isRequired = (val: unknown): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string") return val.trim().length > 0;
    return true;
};
