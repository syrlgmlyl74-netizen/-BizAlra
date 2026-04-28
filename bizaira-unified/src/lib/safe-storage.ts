export const SAFE_STORAGE_PREFIX = "bizaira_";
export const ERROR_RECOVERY_KEY = "bizaira_error_recovery_attempts";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const safeGetItem = (key: string): string | null => {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`safeGetItem failed for ${key}:`, error);
    try {
      window.localStorage.removeItem(key);
    } catch {}
    return null;
  }
};

export const safeSetItem = (key: string, value: string): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`safeSetItem failed for ${key}:`, error);
  }
};

export const safeRemoveItem = (key: string): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`safeRemoveItem failed for ${key}:`, error);
  }
};

export const safeSetSessionItem = (key: string, value: string): void => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`safeSetSessionItem failed for ${key}:`, error);
  }
};

export const safeGetSessionItem = (key: string): string | null => {
  if (!isBrowser()) return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`safeGetSessionItem failed for ${key}:`, error);
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
    return null;
  }
};

export const safeRemoveSessionItem = (key: string): void => {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`safeRemoveSessionItem failed for ${key}:`, error);
  }
};

export const safeJsonParse = <T>(key: string, fallback: T): T => {
  const raw = safeGetItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Invalid JSON stored for ${key}:`, error);
    safeRemoveItem(key);
    return fallback;
  }
};

export const safeParseInt = (key: string, fallback = 0): number => {
  const raw = safeGetItem(key);
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const clearAppStorage = (): void => {
  if (!isBrowser()) return;

  const keysToClear = [
    "bizaira_onboarding",
    "bizaira_language",
    "bizaira_creations_v1",
    "bizaira_creations_count",
    "bizaira_downloads_count",
    "bizaira_first_credit_use",
    "cookieConsent",
    "bizaira_accessibility",
  ];

  for (const key of keysToClear) {
    safeRemoveItem(key);
  }

  try {
    for (const key of Object.keys(window.localStorage)) {
      if (
        key.startsWith("bizaira_memory_") ||
        key.startsWith("sb-") ||
        key.includes("supabase") ||
        key.includes("sb-")
      ) {
        safeRemoveItem(key);
      }
    }
  } catch (error) {
    console.warn("Failed to clean additional storage keys:", error);
  }

  try {
    if (typeof window.sessionStorage !== "undefined") {
      for (const key of Object.keys(window.sessionStorage)) {
        if (key.startsWith("bizaira_") || key.startsWith("sb-") || key.includes("supabase")) {
          window.sessionStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to clean sessionStorage keys:", error);
  }
};

export const hardResetApp = (): void => {
  if (!isBrowser()) return;
  clearAppStorage();
  try {
    window.sessionStorage.removeItem(ERROR_RECOVERY_KEY);
  } catch {}
  window.location.replace("/");
};

export const safeBrowserStorage = {
  getItem: (key: string): string | null => safeGetItem(key),
  setItem: (key: string, value: string): void => safeSetItem(key, value),
  removeItem: (key: string): void => safeRemoveItem(key),
};
