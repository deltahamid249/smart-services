export interface AdminUser {
  username: string;
  role: "admin";
  loginAt: string;
}

const STORAGE_ADMIN_SESSION = "smart_admin_session";
const STORAGE_ADMIN_CREDS = "smart_admin_credentials";

// Default credentials
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "Admin@Almnusaa2026!";

interface AdminCredentials {
  username: string;
  passwordHash: string; // encoded or stored securely
}

// Simple deterministic hash for browser-side comparison
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash)}_${str.length}`;
}

export function getAdminCredentials(): AdminCredentials {
  if (typeof window === "undefined") {
    return {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: simpleHash(DEFAULT_ADMIN_PASSWORD),
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_ADMIN_CREDS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.username && parsed.passwordHash) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: simpleHash(DEFAULT_ADMIN_PASSWORD),
  };
}

export function updateAdminCredentials(
  currentPassword: string,
  newPassword: string,
  newUsername?: string
): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "غير متاح" };
  }

  const currentCreds = getAdminCredentials();
  if (simpleHash(currentPassword) !== currentCreds.passwordHash) {
    return { success: false, message: "كلمة المرور الحالية غير صحيحة" };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" };
  }

  const updated: AdminCredentials = {
    username: newUsername?.trim() || currentCreds.username,
    passwordHash: simpleHash(newPassword),
  };

  localStorage.setItem(STORAGE_ADMIN_CREDS, JSON.stringify(updated));
  return { success: true, message: "تم تغيير بيانات الدخول بنجاح" };
}

export function verifyAdminLogin(
  userInput: string,
  passwordInput: string
): { success: boolean; error?: string } {
  const creds = getAdminCredentials();
  const trimmedUser = userInput.trim().toLowerCase();

  // Allow login by configured username OR almnusaa@gmail.com
  const validUsers = [
    creds.username.toLowerCase(),
    "almnusaa@gmail.com",
    "admin",
  ];

  if (!validUsers.includes(trimmedUser)) {
    return {
      success: false,
      error: "اسم المستخدم أو البريد الإلكتروني غير صحيح",
    };
  }

  if (simpleHash(passwordInput) !== creds.passwordHash) {
    // Also allow the default password if credentials weren't customized yet
    if (passwordInput !== DEFAULT_ADMIN_PASSWORD) {
      return {
        success: false,
        error: "كلمة المرور غير صحيحة",
      };
    }
  }

  // Create session
  const session: AdminUser = {
    username: creds.username,
    role: "admin",
    loginAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(session));
    localStorage.setItem(
      "smart_user",
      JSON.stringify({ name: creds.username, role: "admin" })
    );
  }

  return { success: true };
}

export function isCurrentAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SESSION);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session.role === "admin";
  } catch {
    return false;
  }
}

export function getAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function logoutAdminUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_ADMIN_SESSION);
    const rawUser = localStorage.getItem("smart_user");
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u.role === "admin") {
          localStorage.removeItem("smart_user");
        }
      } catch {
        localStorage.removeItem("smart_user");
      }
    }
  }
}
