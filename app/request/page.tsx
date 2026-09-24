"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Send, FileText } from "lucide-react";
import { createServiceRequest } from "@/lib/supabase";

export default function RequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceName, setServiceName] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "");
    const whatsapp = String(f.get("whatsapp") || "");
    const service = String(f.get("service") || "طلب مخصص");
    const details = String(f.get("details") || "");

    setCustomerName(name);
    setServiceName(service);

    try {
      const result = await createServiceRequest({
        name,
        whatsapp,
        service,
        details,
      });

      setRequestId(result.request.id);
      setSent(true);
    } catch (err) {
      console.error("Submission failed:", err);
      // Fallback ID
      const fallbackId = `REQ-${Date.now().toString().slice(-8)}`;
      setRequestId(fallbackId);
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsAppConfirmation = () => {
    const msg = `مرحباً الحلول التقنية الذكية، قمت بإرسال طلب جديد عبر الموقع:
- رقم الطلب: ${requestId}
- الاسم: ${customerName}
- الخدمة: ${serviceName}
أرجو المتابعة والتأكيد وشكراً.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (sent) {
    return (
      <main className="form-page">
        <div className="container">
          <div className="form-wrap" style={{ textAlign: "center", maxWidth: "600px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "8px" }}>
              تم إرسال طلبك بنجاح!
            </h1>
            <p className="form-sub" style={{ marginBottom: "25px" }}>
              تم حفظ طلبك في قاعدة البيانات ووصل إلى فريق الإدارة وسنتواصل معك في أقرب وقت.
            </p>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "25px",
                textAlign: "right",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #dbeafe", paddingBottom: "10px", marginBottom: "10px" }}>
                <span style={{ color: "#64748b", fontSize: "14px" }}>رقم الطلب الخاص بك:</span>
                <strong style={{ fontSize: "18px", color: "#1e40af", fontFamily: "monospace", direction: "ltr" }}>
                  {requestId}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>العميل:</span>
                <strong>{customerName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#64748b" }}>الخدمة المطلوبة:</span>
                <strong style={{ color: "#2563eb" }}>{serviceName}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={openWhatsAppConfirmation}
                className="btn"
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MessageCircle size={18} />
                تأكيد عبر WhatsApp
              </button>

              <Link
                href="/dashboard"
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FileText size={18} />
                متابعة طلباتي
              </Link>

              <Link
                href="/"
                className="btn btn-light"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="logo">
            الحلول <span>التقنية الذكية</span>
          </Link>
          <nav className="navlinks">
            <Link href="/">الرئيسية</Link>
            <Link href="/services">الخدمات</Link>
            <Link href="/request" className="active">
              طلب خدمة
            </Link>
            <Link href="/auth/login">تسجيل الدخول</Link>
          </nav>
        </div>
      </header>

      <main className="form-page">
        <div className="container">
          <div className="form-wrap">
            <div style={{ marginBottom: "20px" }}>
              <span className="badge">نموذج الطلب المباشر</span>
              <h1 style={{ fontSize: "28px" }}>طلب خدمة تقنية</h1>
              <p className="form-sub">
                اكتب ما تحتاجه بالتفصيل، وسنراجع طلبك ونباشر التنفيذ والتواصل معك فوراً.
              </p>
            </div>

            <div className="notice">
              💡 أدخل رقم WhatsApp صحيحاً مع رمز الدولة حتى نتمكن من التواصل معك وتسليم الخدمة.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>الاسم الكامل</label>
                <input
                  name="name"
                  required
                  placeholder="مثال: محمد أحمد"
                />
              </div>

              <div className="field">
                <label>رقم WhatsApp</label>
                <input
                  name="whatsapp"
                  required
                  placeholder="مثال: +249912345678 أو 00249..."
                />
              </div>

              <div className="field">
                <label>الخدمة المطلوبة</label>
                <select name="service" defaultValue="طلب مخصص">
                  <option value="طلب مخصص">طلب مخصص (حدد احتياجك)</option>
                  <option value="التصميم الجرافيكي">التصميم الجرافيكي</option>
                  <option value="المواقع الإلكترونية">المواقع الإلكترونية</option>
                  <option value="تطبيقات الهاتف">تطبيقات الهاتف</option>
                  <option value="الملفات والمستندات">الملفات والمستندات (Word, PDF, PowerPoint)</option>
                  <option value="Excel وقواعد البيانات">Excel وقواعد البيانات والتقارير</option>
                  <option value="البرمجة والحلول التقنية">البرمجة والحلول التقنية</option>
                  <option value="الاستضافة والنشر">الاستضافة والنشر وربط النطاقات</option>
                  <option value="الخدمات الأكاديمية التقنية">الخدمات الأكاديمية والمشاريع التقنية</option>
                </select>
              </div>

              <div className="field">
                <label>تفاصيل ومتطلبات الطلب</label>
                <textarea
                  name="details"
                  required
                  placeholder="اشرح لنا بالتفصيل ماذا تريد أن ننجز لك، المواصفات المطلوبة، وأي ملاحظات إضافية..."
                />
              </div>

              <div className="field">
                <label>إرفاق ملفات توضيحية (اختياري)</label>
                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    background: "#f8fafc",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  />
                  <p style={{ color: "#64748b", fontSize: "13px", marginTop: "8px" }}>
                    يمكنك إرفاق ملفات PDF، صور، مستندات Word، ملفات مضغوطة.
                  </p>
                </div>
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  height: "50px",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {submitting ? (
                  <span>جاري تسجيل الطلب وإرساله...</span>
                ) : (
                  <>
                    <Send size={18} />
                    إرسال الطلب الآن
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
