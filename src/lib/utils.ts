import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { sanitizeText } from "./security/sanitize"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeInput(str: string): string {
  if (!str) return '';
  return sanitizeText(str);
}

export { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeIdentifier } from "./security/sanitize";


