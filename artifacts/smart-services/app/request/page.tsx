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

const toAsciiDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660)
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0)
    );

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

    const form = new FormData(event.currentTarget);

    const name = String(
      form.get("name") || ""
    ).trim();

    const countryCode = toAsciiDigits(
      String(form.get("countryCode") || "").trim()
    ).replace(/\s+/g, "");

    const phoneNumber = toAsciiDigits(
      String(form.get("whatsappNumber") || "").trim()
    ).replace(/\D/g, "");

    if (!/^\+[1-9]\d{0,2}$/.test(countryCode)) {
      alert(
        "أدخل مفتاح الدولة في الخانة المخصصة بصيغة دولية، مثل +249."
      );
      return;
    }

    if (phoneNumber.length < 6 || phoneNumber.length > 14) {
      alert(
        "أدخل رقم الهاتف بالأرقام فقط، دون مفتاح الدولة."
      );
      return;
    }

    const internationalDigits =
      `${countryCode.slice(1)}${phoneNumber}`;

    if (internationalDigits.length > 15) {
      alert(
        "رقم الهاتف طويل أكثر من اللازم. تحقق من مفتاح الدولة والرقم."
      );
      return;
    }

    const whatsapp = `+${internationalDigits}`;

    const service = String(
      form.get("service") || "طلب مخصص"
    ).trim();

    const details = String(
      form.get("details") || ""
    ).trim();

    setSubmitting(true);
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
      <div className="ss-home ss-request-page" dir="rtl">
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
      </div>
    );
  }

  return (
    <div className="ss-home ss-request-page" dir="rtl">
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
                اتبع الخطوات، وسنراجع طلبك ونتواصل معك عبر WhatsApp.
              </p>
            </div>

            <ol
              className="request-steps"
              aria-label="خطوات إرسال الطلب"
            >
              <li className="request-step-card">
                <span className="request-step-number">١</span>
                <div className="request-step-copy">
                  <strong>أدخل بياناتك</strong>
                  <span>اكتب اسمك ومعلومات التواصل.</span>
                </div>
              </li>
              <li className="request-step-card">
                <span className="request-step-number">٢</span>
                <div className="request-step-copy">
                  <strong>اختر الخدمة</strong>
                  <span>حدد نوع الخدمة التي تحتاجها.</span>
                </div>
              </li>
              <li className="request-step-card">
                <span className="request-step-number">٣</span>
                <div className="request-step-copy">
                  <strong>اشرح المطلوب</strong>
                  <span>اكتب التفاصيل والمواصفات بوضوح.</span>
                </div>
              </li>
              <li className="request-step-card">
                <span className="request-step-number">٤</span>
                <div className="request-step-copy">
                  <strong>أرفق الملفات وأرسل</strong>
                  <span>المرفقات اختيارية؛ احتفظ برمز المتابعة.</span>
                </div>
              </li>
            </ol>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="request-name">
                  الاسم الكامل
                </label>

                <input
                  id="request-name"
                  name="name"
                  required
                  placeholder="مثال: محمد أحمد"
                />
              </div>

              <div className="field">
                <div className="phone-fields">
                  <div>
                    <label htmlFor="country-code">
                      مفتاح الدولة *
                    </label>

                    <input
                      id="country-code"
                      className="phone-input"
                      name="countryCode"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-country-code"
                      maxLength={4}
                      pattern="[+][1-9١-٩۱-۹][0-9٠-٩۰-۹]{0,2}"
                      title="أدخل مفتاح الدولة بصيغة دولية مثل +249"
                      placeholder="+249"
                      aria-describedby="country-code-hint"
                      required
                    />

                    <span
                      id="country-code-hint"
                      className="phone-field-hint"
                    >
                      مثال: +249 للسودان
                    </span>
                  </div>

                  <div>
                    <label htmlFor="whatsapp-number">
                      رقم WhatsApp *
                    </label>

                    <input
                      id="whatsapp-number"
                      className="phone-input"
                      name="whatsappNumber"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      pattern="[0-9٠-٩۰-۹]{6,14}"
                      title="أدخل أرقام الهاتف فقط دون مفتاح الدولة"
                      placeholder="912345678"
                      aria-describedby="phone-number-hint"
                      required
                    />

                    <span
                      id="phone-number-hint"
                      className="phone-field-hint"
                    >
                      أدخل الرقم المحلي فقط، دون مفتاح الدولة
                    </span>
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="request-service">
                  الخدمة المطلوبة
                </label>

                <select
                  id="request-service"
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
                <label htmlFor="request-details">
                  تفاصيل ومتطلبات الطلب
                </label>

                <textarea
                  id="request-details"
                  name="details"
                  required
                  placeholder="اشرح لنا بالتفصيل ماذا تريد أن ننجز لك، المواصفات المطلوبة، وأي ملاحظات إضافية..."
                />
              </div>

              <div className="field">
                <label htmlFor="request-files">
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
                    id="request-files"
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
    </div>
  );
}
