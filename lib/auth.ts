import { getSupabaseClient } from "@/lib/supabase";

export interface AdminUser {
  username: string;
  role: "admin";
  loginAt: string;
  userId?: string;
}

const STORAGE_ADMIN_SESSION = "smart_admin_session";

interface AdminProfile {
  id: string;
  full_name: string;
  whatsapp: string | null;
  role: string;
}

function getClient() {
  return getSupabaseClient();
}

/**
 * تسجيل دخول المدير باستخدام Supabase Auth
 */
export async function verifyAdminLogin(
  userInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const client = getClient();

  if (!client) {
    return {
      success: false,
      error:
        "تعذر الاتصال بـ Supabase. تأكد من NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const identifier = userInput.trim();

  if (!identifier || !passwordInput) {
    return {
      success: false,
      error: "يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور.",
    };
  }

  const email =
    identifier.toLowerCase() === "admin"
      ? "almnusaa@gmail.com"
      : identifier;

  if (!email.includes("@")) {
    return {
      success: false,
      error:
        "يرجى استخدام البريد الإلكتروني المرتبط بحساب المدير.",
    };
  }

  try {
    const { data, error } =
      await client.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

    /*
     * مهم:
     * نعرض رسالة Supabase الحقيقية مؤقتًا لتحديد سبب المشكلة.
     * لا يتم عرض كلمة المرور أو أي مفتاح سري.
     */
    if (error) {
      console.error("Supabase Admin Login Error:", error);

      return {
        success: false,
        error: `Supabase: ${error.message}`,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Supabase لم يُرجع حساب مستخدم بعد تسجيل الدخول.",
      };
    }

    /*
     * بعد نجاح تسجيل الدخول، نتحقق من صلاحية المستخدم
     * من جدول profiles.
     */
    const { data: profile, error: profileError } =
      await client
        .from("profiles")
        .select("id, full_name, whatsapp, role")
        .eq("id", data.user.id)
        .maybeSingle<AdminProfile>();

    if (profileError) {
      console.error(
        "Supabase Profile Error:",
        profileError
      );

      await client.auth.signOut();

      return {
        success: false,
        error: `تم تسجيل الدخول، لكن تعذر قراءة صلاحية الإدارة: ${profileError.message}`,
      };
    }

    if (!profile) {
      await client.auth.signOut();

      return {
        success: false,
        error:
          "تم تسجيل الدخول بنجاح، لكن لا يوجد سجل لهذا الحساب في جدول profiles.",
      };
    }

    if (profile.role !== "admin") {
      await client.auth.signOut();

      return {
        success: false,
        error:
          `تم تسجيل الدخول، لكن صلاحية الحساب الحالية هي "${profile.role}" وليست "admin".`,
      };
    }

    const session: AdminUser = {
      username:
        profile.full_name ||
        data.user.email ||
        "admin",
      role: "admin",
      loginAt: new Date().toISOString(),
      userId: data.user.id,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_ADMIN_SESSION,
        JSON.stringify(session)
      );

      localStorage.setItem(
        "smart_user",
        JSON.stringify({
          name: session.username,
          role: "admin",
        })
      );
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error("Admin Login Exception:", err);

    return {
      success: false,
      error:
        err instanceof Error
          ? `خطأ: ${err.message}`
          : "حدث خطأ غير معروف أثناء تسجيل الدخول.",
    };
  }
}

/**
 * التحقق من وجود جلسة مدير فعالة
 */
export async function isCurrentAdminAuthenticated(): Promise<boolean> {
  const client = getClient();

  if (!client) {
    return false;
  }

  try {
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      clearLocalAdminSession();
      return false;
    }

    const { data: profile, error } =
      await client
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: string }>();

    if (error || !profile || profile.role !== "admin") {
      await client.auth.signOut();
      clearLocalAdminSession();
      return false;
    }

    return true;
  } catch {
    clearLocalAdminSession();
    return false;
  }
}

/**
 * الحصول على بيانات جلسة المدير المحلية
 */
export function getAdminSession(): AdminUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(
      STORAGE_ADMIN_SESSION
    );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * مسح جلسة المدير المحلية
 */
function clearLocalAdminSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    STORAGE_ADMIN_SESSION
  );

  localStorage.removeItem("smart_user");
}

/**
 * تسجيل خروج المدير
 */
export async function logoutAdminUser(): Promise<void> {
  const client = getClient();

  try {
    if (client) {
      await client.auth.signOut();
    }
  } finally {
    clearLocalAdminSession();
  }
}
