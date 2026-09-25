"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from "lucide-react";
import {
  verifyAdminLogin,
  isCurrentAdminAuthenticated,
} from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminSession = async () => {
      try {
        const authenticated = await isCurrentAdminAuthenticated();

        if (mounted && authenticated) {
          router.replace("/admin");
          return;
        }
      } catch {
        // لا توجد جلسة إدارة فعالة
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkAdminSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMsg("");
    setLoading(true);

    try {
      const result = await verifyAdminLogin(
        username.trim(),
        password
      );

      if (!result.success) {
        setErrorMsg(
          result.error || "بيانات دخول المدير غير صحيحة."
        );
        return;
      }

      router.replace("/admin");
    } catch (error) {
      console.error("Admin login error:", error);

      setErrorMsg(
        "حدث خطأ أثناء تسجيل دخول المدير. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="auth">
        <div
          className="auth-box"
          style={{
            width: "min(480px, 100%)",
            textAlign: "center",
          }}
        >
          <div className="auth-logo">
            <Link href="/" className="logo">
              الحلول <span>التقنية الذكية</span>
            </Link>
          </div>

          <p className="form-sub">
            جاري التحقق من جلسة الإدارة...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth">
      <div
        className="auth-box"
        style={{
          width: "min(480px, 100%)",
        }}
      >
        <div className="auth-logo">
          <Link href="/" className="logo">
            الحلول <span>التقنية الذكية</span>
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            margin: "0 auto 18px",
            borderRadius: "18px",
            background: "#eff6ff",
            color: "#2563eb",
          }}
        >
          <ShieldCheck size={32} />
        </div>

        <div>
          <h1
            style={{
              fontSize: "24px",
              marginBottom: "6px",
              textAlign: "center",
            }}
          >
            تسجيل دخول الإدارة
          </h1>

          <p
            className="form-sub"
            style={{
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            هذه الصفحة مخصصة لمسؤول النظام فقط.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "12px 14px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircle
              size={18}
              style={{
                flexShrink: 0,
              }}
            />

            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <User size={16} color="#64748b" />
              اسم المستخدم أو البريد الإلكتروني
            </label>

            <input
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin أو البريد الإلكتروني"
              autoComplete="username"
              dir="ltr"
            />
          </div>

          <div className="field">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Lock size={16} color="#64748b" />
              كلمة المرور
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
                style={{
                  paddingLeft: "42px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                aria-label={
                  showPassword
                    ? "إخفاء كلمة المرور"
                    : "إظهار كلمة المرور"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{
              width: "100%",
              height: "48px",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            disabled={loading}
          >
            {loading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <LogIn size={18} />
                دخول إلى لوحة الإدارة
              </>
            )}
          </button>
        </form>

        <div
          className="auth-footer"
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#64748b",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
