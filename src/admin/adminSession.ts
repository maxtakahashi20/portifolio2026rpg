import { ADMIN_SECRET_STORAGE_KEY } from "../config/admin";

export function getStoredAdminSecret(): string {
  try {
    return sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredAdminSecret(secret: string): void {
  sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, secret.trim());
}

export function clearStoredAdminSecret(): void {
  sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
}
