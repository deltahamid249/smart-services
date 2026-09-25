"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircle,
  Send,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { createServiceRequest } from "@/lib/supabase";

export default function RequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [serviceName, setServiceName] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    const form = new FormData(event.currentTarget);

    const name = String(
      form.get("name") || ""
    ).trim();

    const whatsapp = String(
      form.get("whatsapp") || ""
    ).trim();

    const service = String(
      form.get("service") || "طلب مخصص"
    ).trim();

    const details = String(
      form.get("details") || ""
    ).trim();

    setCustomerName(name);
    setServiceName(service);

    try {
      const result =
        await createServiceRequest({
          name,
          whatsapp,
          service,
          details,
        });

      setRequestId(result.request.id);
      setTrackingToken(
        result.request.tracking_token || ""
      );
      setSent(true);
    } catch (error) {
      console.error(
        "Submission failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "تعذر إرسال الطلب. حاول مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingToken = async () => {
    if (!trackingToken) return;

    try {
      await navigator.clipboard.writeText(
        trackingToken
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert(
        "تعذر نسخ رمز المتابعة. يمكنك تحديده ونسخه يدويًا."
      );
    }
  };

  const openWhatsAppConfirmation = () => {
    const message = `مرحباً الحلول التقنية الذكية، قمت بإرسال طلب جديد عبر الموقع:

- رقم الطلب: ${requestId}
- رمز المتابعة: ${trackingToken}
- الاسم: ${customerName}
- الخدمة: ${serviceName}

أرجو المتابعة والتأكيد وشكراً.`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (sent) {
    return (
      <main className="form-page">
        <div className="container">
          <div
            className="form-wrap"
            style={{
              textAlign: "center",
              maxWidth: "650px",
            }}
          >
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

            <h1
              style={{
                fontSize: "28px",
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              تم إرسال طلبك بنجاح!
            </h1>

            <p
              className="form-sub"
              style={{ marginBottom: "25px" }}
            >
              تم حفظ طلبك بنجاح. احتفظ برقم الطلب ورمز
              المتابعة لمتابعة حالة طلبك لاحقًا.
            </p>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  borderBottom:
                    "1px solid #dbeafe",
                  paddingBottom: "12px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  رقم الطلب:
                </span>

                <strong
                  style={{
                    fontSize: "18px",
                    color: "#1e40af",
                    fontFamily: "monospace",
                    direction: "ltr",
                  }}
                >
                  {requestId}
                </strong>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    رمز المتابعة الخاص بك:
                  </span>

                  <button
                    type="button"
                    onClick={
                      copyTrackingToken
                    }
                    className="btn btn-light"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 12px",
                      fontSize: "13px",
                    }}
                  >
                    {copied ? (
                      <Check size={15} />
                    ) : (
                      <Copy size={15} />
                    )}

                    {copied
                      ? "تم النسخ"
                      : "نسخ الرمز"}
                  </button>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border:
                      "1px solid #bfdbfe",
                    borderRadius: "10px",
                    padding: "12px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#1e3a8a",
                    wordBreak: "break-all",
                    direction: "ltr",
                    textAlign: "left",
                  }}
                >
                  {trackingToken}
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "8px",
                    lineHeight: "1.7",
                  }}
                >
                  احتفظ بهذا الرمز ولا تشاركه مع الآخرين؛
                  فهو يستخدم للوصول إلى تفاصيل طلبك.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontSize: "14px",
                  marginBottom: "7px",
                }}
              >
                <span
                  style={{ color: "#64748b" }}
                >
                  العميل:
                </span>

                <strong>
                  {customerName}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontSize: "14px",
                  gap: "10px",
                }}
              >
                <span
                  style={{ color: "#64748b" }}
                >
                  الخدمة المطلوبة:
                </span>

                <strong
                  style={{
                    color: "#2563eb",
                    textAlign: "left",
                  }}
                >
                  {serviceName}
                </strong>
              </div>
            </div>

            <div
              className="notice"
              style={{
                marginBottom: "20px",
                textAlign: "right",
              }}
            >
              احتفظ برقم الطلب ورمز المتابعة. ستحتاج إليهما
              عند متابعة حالة الطلب.
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={
                  openWhatsAppConfirmation
                }
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
                href={`/dashboard?token=${encodeURIComponent(
                  trackingToken
                )}`}
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FileText size={18} />
                متابعة طلباتي
              </Link>

              <Link
                href="/"
                className="btn btn-light"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
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
            <Link href="/">
              الرئيسية
            </Link>

            <Link href="/services">
              الخدمات
            </Link>

            <Link
              href="/request"
              className="active"
            >
              طلب خدمة
            </Link>
          </nav>
        </div>
      </header>

      <main className="form-page">
        <div className="container">
          <div className="form-wrap">
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <span className="badge">
                نموذج الطلب المباشر
              </span>

              <h1
                style={{
                  fontSize: "28px",
                }}
              >
                طلب خدمة تقنية
              </h1>

              <p className="form-sub">
                اكتب ما تحتاجه بالتفصيل، وسنراجع طلبك
                ونباشر التنفيذ والتواصل معك فوراً.
              </p>
            </div>

            <div className="notice">
              💡 أدخل رقم WhatsApp صحيحاً مع رمز الدولة
              حتى نتمكن من التواصل معك وتسليم الخدمة.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>
                  الاسم الكامل
                </label>

                <input
                  name="name"
                  required
                  placeholder="مثال: محمد أحمد"
                />
              </div>

              <div className="field">
                <label>
                  رقم WhatsApp
                </label>

                <input
                  name="whatsapp"
                  required
                  placeholder="مثال: +249912345678 أو 00249..."
                />
              </div>

              <div className="field">
                <label>
                  الخدمة المطلوبة
                </label>

                <select
                  name="service"
                  defaultValue="طلب مخصص"
                >
                  <option value="طلب مخصص">
                    طلب مخصص (حدد احتياجك)
                  </option>

                  <option value="التصميم الجرافيكي">
                    التصميم الجرافيكي
                  </option>

                  <option value="المواقع الإلكترونية">
                    المواقع الإلكترونية
                  </option>

                  <option value="تطبيقات الهاتف">
                    تطبيقات الهاتف
                  </option>

                  <option value="الملفات والمستندات">
                    الملفات والمستندات (Word, PDF,
                    PowerPoint)
                  </option>

                  <option value="Excel وقواعد البيانات">
                    Excel وقواعد البيانات والتقارير
                  </option>

                  <option value="البرمجة والحلول التقنية">
                    البرمجة والحلول التقنية
                  </option>

                  <option value="الاستضافة والنشر">
                    الاستضافة والنشر وربط النطاقات
                  </option>

                  <option value="الخدمات الأكاديمية التقنية">
                    الخدمات الأكاديمية والمشاريع التقنية
                  </option>
                </select>
              </div>

              <div className="field">
                <label>
                  تفاصيل ومتطلبات الطلب
                </label>

                <textarea
                  name="details"
                  required
                  placeholder="اشرح لنا بالتفصيل ماذا تريد أن ننجز لك، المواصفات المطلوبة، وأي ملاحظات إضافية..."
                />
              </div>

              <div className="field">
                <label>
                  إرفاق ملفات توضيحية (اختياري)
                </label>

                <div
                  style={{
                    border:
                      "2px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    background: "#f8fafc",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    style={{
                      border: "none",
                      background:
                        "transparent",
                      cursor: "pointer",
                    }}
                  />

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      marginTop: "8px",
                    }}
                  >
                    يمكنك إرفاق ملفات PDF، صور،
                    مستندات Word، ملفات مضغوطة.
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
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                {submitting ? (
                  <span>
                    جاري تسجيل الطلب وإرساله...
                  </span>
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
