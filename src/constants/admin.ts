/**
 * Admin email whitelist - single source of truth
 * These emails have admin privileges in the system
 */
export const ADMIN_EMAILS = [
  "krimishay68@gmail.com",
  "eladassif@gmail.com"
] as const;

/**
 * Check if an email is an admin email (case-insensitive)
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalizedEmail);
}

