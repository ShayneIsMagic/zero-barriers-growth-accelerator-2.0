import { USER_ROLES } from '@/constants';

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === USER_ROLES.SUPER_ADMIN;
}

export function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAIL || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isConfiguredSuperAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getSuperAdminEmails().includes(normalized);
}
