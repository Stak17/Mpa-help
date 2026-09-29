// Default list of administrator emails
export const ADMIN_EMAILS = [
  'travourstak22@gmail.com',
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
