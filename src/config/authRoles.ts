/**
 * Authentication roles configuration
 * Admin emails are defined here - passwords are managed in Firebase Console
 */

export type UserRole = "admin" | "user";

/**
 * List of admin email addresses (case-insensitive)
 * These users will have admin role when authenticated
 */
export const ADMIN_EMAILS: readonly string[] = [
  "krimishay68@gmail.com",
  "elad.assif@gmail.com",
] as const;

/**
 * Check if an email is an admin email (case-insensitive)
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalizedEmail);
}

