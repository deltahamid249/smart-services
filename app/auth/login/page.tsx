"use client";

import { FormEvent, useState, useEffect } from "react";
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
  HelpCircle,
  KeyRound,
} from "lucide-react";
import { verifyAdminLogin, isCurrentAdminAuthenticated } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    // If already logged in as admin and trying to visit login
    if (isCurrentAdminAuthenticated()) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (role === "admin") {
      const result = verifyAdminLogin(username, password);
      if (!result.success) {
        setErrorMsg(result.error || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } else {
      // Customer login
      localStorage.setItem(
        "smart_user",
        JSON.stringify({ name: username || "عميل", role: "user" })
      );
      router.push("/dashboard");
    }
  };

  return (
    <main className="auth">
      <div className="auth-box" style={{ width: "min(480px, 100%)" }}>
        <div className="auth-logo">
          <Link href="/" className="logo">
            الحلول <span>التقنية الذكية</span>
          </Link>
        </div>

        {/* Role Toggle Tabs */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "24px",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              background: role === "admin" ? "#2563eb" : "transparent",
              color: role === "admin" ? "#ffffff" : "#64748b",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <ShieldCheck size={18} />
            لوحة الإدارة (Admin)
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("user");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              background: role === "user" ? "#2563eb" : "transparent",
              color: role === "user" ? "#ffffff" : "#64748b",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <User size={18} />
            بوابة العميل
          </button>
        </div>

        <div>
          <h1 style={{ fontSize: "24px", marginBottom: "6px" }}>
            {role === "admin" ? "تسجيل دخول الإدارة" : "تسجيل دخول العميل"}
          </h1>
          <p className="form-sub" style={{ marginBottom: "20px" }}>
            {role === "admin"
              ? "أدخل اسم المستخدم وكلمة المرور للتحكم في الطلبات ولوحة الإدارة."
              : "ادخل بياناتك لمتابعة حالة وتفاصيل طلباتك السابقة."}
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
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={16} color="#64748b" />
              {role === "admin"
                ? "اسم المستخدم أو البريد الإلكتروني"
                : "الاسم أو رقم الهاتف"}
            </label>
            <input
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                role === "admin" ? "admin أو البريد الإلكتروني" : "محمد أحمد"
              }
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Lock size={16} color="#64748b" />
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ paddingLeft: "42px" }}
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
                }}
                aria-label="إظهار أو إخفاء كلمة المرور"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {role === "admin" && (
            <div style={{ marginBottom: "18px" }}>
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <HelpCircle size={15} />
                {showHints ? "إخفاء بيانات الدخول الافتراضية" : "نسيت بيانات الدخول أو للمرة الأولى؟"}
              </button>

              {showHints && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px 14px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#166534",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <KeyRound size={15} />
                    بيانات المدير الافتراضية للنظام:
                  </div>
                  <div>المستخدم: <code>admin</code> أو <code>almnusaa@gmail.com</code></div>
                  <div>كلمة المرور: <code>Admin@Almnusaa2026!</code></div>
                  <div style={{ marginTop: "4px", fontSize: "11px", color: "#15803d" }}>
                    (يمكنك تغيير كلمة المرور واسم المستخدم في أي وقت من لوحة الإدارة)
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="btn btn-primary"
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
                دخول إلى {role === "admin" ? "لوحة الإدارة" : "حسابي"}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "24px", textAlign: "center" }}>
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
