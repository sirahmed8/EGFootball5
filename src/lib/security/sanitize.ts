/**
 * Comprehensive input sanitization and XSS prevention utilities.
 * Enforces bounded input lengths, control character stripping, and character escaping.
 */

/**
 * Strips HTML tags, trims whitespace, and escapes special HTML entities to prevent XSS.
 */
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  // 1. Strip null bytes and control characters (except newline and tab)
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip potential <script>, <iframe>, or javascript: payloads
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/on\w+\s*=/gi, '');

  // 3. Escape HTML entities
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // 4. Enforce strict character bound
  return clean.trim().slice(0, maxLength);
}

/**
 * Sanitizes and validates phone numbers (Egyptian & international formats).
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  // Keep only digits and leading plus sign
  const clean = input.trim().replace(/[^\d+]/g, '');
  return clean.slice(0, 16);
}

/**
 * Sanitizes email addresses.
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  const clean = input.trim().toLowerCase();
  // Basic validation pattern
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
  return isValid ? clean.slice(0, 120) : '';
}

/**
 * Sanitizes alphanumeric identifiers (usernames, booking codes, IDs).
 */
export function sanitizeIdentifier(input: unknown, maxLength: number = 50): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^a-zA-Z0-9_\-\.]/g, '')
    .slice(0, maxLength);
}
