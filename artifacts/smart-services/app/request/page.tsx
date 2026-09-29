"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileText,
  MessageCircle,
  Phone,
  Send,
  UserRound,
} from "lucide-react";
import { createServiceRequest } from "@/lib/supabase";

type RequestStep = 1 | 2 | 3;

const serviceOptions = [
  "طلب مخصص",
  "التصميم الجرافيكي",
  "المواقع الإلكترونية",
  "تطبيقات الهاتف",
  "الملفات والمستندات",
  "Excel وقواعد البيانات",
  "البرمجة والحلول التقنية",
  "الاستضافة والنشر",
  "الخدمات الأكاديمية التقنية",
];

const toAsciiDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660)
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0)
    );

const normalizeCountryCode = (value: string) =>
  toAsciiDigits(value).replace(/\s+/g, "");

const normalizeLocalNumber = (value: string) =>
  toAsciiDigits(value).replace(/\D/g, "");

const withoutTrunkZero = (value: string) => value.replace(/^0/, "");

export default function RequestPage() {
  const [activeStep, setActiveStep] = useState<RequestStep>(1);
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("+249");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceName, setServiceName] = useState("طلب مخصص");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedCountryCode = normalizeCountryCode(countryCode);
  const normalizedPhone = normalizeLocalNumber(phoneNumber);
  const localPhone = withoutTrunkZero(normalizedPhone);
  const validCountryCode = /^\+[1-9]\d{0,2}$/.test(
    normalizedCountryCode
  );
  const validPhone =
    validCountryCode &&
    localPhone.length >= 6 &&
    localPhone.length <= 14 &&
    localPhone.length + normalizedCountryCode.slice(1).length <= 15;
  const validName = customerName.trim().length >= 2;
  const validDetails = details.trim().length >= 3;

  const openStep = (step: RequestStep) => {
    if (
      step === 2 &&
      !nameConfirmed
    ) {
      return;
    }

    if (
      step === 3 &&
      !contactConfirmed
    ) {
      return;
    }

    setErrorMessage("");
    setActiveStep(step);
  };

  const confirmName = () => {
    if (!validName) return;

    setNameConfirmed(true);
    setErrorMessage("");
    setActiveStep(2);
  };

  const confirmContact = () => {
    if (!validPhone) return;

    setContactConfirmed(true);
    setErrorMessage("");
    setActiveStep(3);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting || !validName || !validPhone || !validDetails) {
      return;
    }

    const internationalNumber = `+${normalizedCountryCode.slice(
      1
    )}${localPhone}`;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await createServiceRequest({
        name: customerName.trim(),
        whatsapp: internationalNumber,
        service: serviceName.trim() || "طلب مخصص",
        details: details.trim(),
      });

      setRequestId(result.request.id);
      setTrackingToken(result.request.tracking_token || "");
      setSent(true);
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMessage(
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
      await navigator.clipboard.writeText(trackingToken);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage(
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
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (sent) {
    return (
      <div className="ss-home ss-request-page" dir="rtl">
        <header className="header">
          <div className="container nav">
            <Link href="/" className="logo">
              الحلول <span>التقنية الذكية</span>
            </Link>
            <nav className="navlinks" aria-label="التنقل الرئيسي">
              <Link href="/">الرئيسية</Link>
              <Link href="/services">الخدمات</Link>
              <Link href="/request" className="active">
                طلب خدمة
              </Link>
            </nav>
          </div>
        </header>

        <main className="request-page">
          <div className="container">
            <section className="request-success" aria-labelledby="success-title">
              <div className="success-mark" aria-hidden="true">
                <CheckCircle2 size={32} />
              </div>
              <span className="request-kicker">تم استلام طلبك</span>
              <h1 id="success-title">طلبك في الطريق الصحيح</h1>
              <p className="request-lede">
                حفظنا التفاصيل بنجاح. احتفظ بالبيانات التالية لمتابعة الطلب
                والتواصل معنا بسهولة.
              </p>

              <div className="success-summary">
                <div className="summary-line">
                  <span>رقم الطلب</span>
                  <strong dir="ltr">{requestId}</strong>
                </div>
                <div className="summary-token">
                  <div className="summary-token-head">
                    <span>رمز المتابعة الخاص بك</span>
                    <button
                      type="button"
                      className="token-copy"
                      onClick={copyTrackingToken}
                      aria-label="نسخ رمز المتابعة"
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? "تم النسخ" : "نسخ الرمز"}
                    </button>
                  </div>
                  <code dir="ltr">{trackingToken}</code>
                  <small>
                    احتفظ بالرمز ولا تشاركه مع الآخرين؛ ستحتاج إليه عند
                    متابعة حالة طلبك.
                  </small>
                </div>
                <div className="summary-line">
                  <span>الخدمة</span>
                  <strong>{serviceName}</strong>
                </div>
              </div>

              <div className="request-note">
                <FileText size={18} aria-hidden="true" />
                <span>
                  إذا كانت لديك ملفات توضيحية، أرسلها بعد الإرسال عبر WhatsApp
                  مع رقم الطلب.
                </span>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="request-button request-button-whatsapp"
                  onClick={openWhatsAppConfirmation}
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  تأكيد عبر WhatsApp
                </button>
                <Link
                  href={`/dashboard?token=${encodeURIComponent(
                    trackingToken
                  )}`}
                  className="request-button request-button-primary"
                >
                  <FileText size={18} aria-hidden="true" />
                  متابعة الطلب
                </Link>
                <Link
                  href="/"
                  className="request-button request-button-secondary"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </section>
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
          <nav className="navlinks" aria-label="التنقل الرئيسي">
            <Link href="/">الرئيسية</Link>
            <Link href="/services">الخدمات</Link>
            <Link href="/request" className="active">
              طلب خدمة
            </Link>
          </nav>
        </div>
      </header>

      <main className="request-page">
        <div className="container">
          <section className="request-intro">
            <span className="request-kicker">نبدأ بخطوة واضحة</span>
            <h1>اطلب خدمتك بدون تعقيد</h1>
            <p className="request-lede">
              ثلاث خطوات قصيرة تكفي. اكتب ما نحتاجه للتواصل والفهم، وسنتولى
              الباقي.
            </p>
          </section>

          <div className="request-layout">
            <aside className="request-aside" aria-label="معلومات الطلب">
              <div className="aside-card">
                <span className="aside-icon" aria-hidden="true">
                  <ClipboardList size={20} />
                </span>
                <strong>طلب واحد، متابعة واضحة</strong>
                <p>
                  بعد الإرسال تحصل على رقم طلب ورمز خاص لمتابعة آخر المستجدات.
                </p>
              </div>
              <div className="aside-card aside-card-soft">
                <span className="aside-icon" aria-hidden="true">
                  <Phone size={20} />
                </span>
                <strong>تواصل على الرقم الذي تختاره</strong>
                <p>
                  يبدأ النموذج بمفتاح السودان +249 ويمكنك تغييره إذا كنت خارج
                  السودان.
                </p>
              </div>
            </aside>

            <section className="request-card" aria-labelledby="flow-title">
              <div className="request-card-head">
                <div>
                  <span className="request-kicker">النموذج المباشر</span>
                  <h2 id="flow-title">أخبرنا بما تحتاج</h2>
                </div>
                <span className="request-count">٣ خطوات</span>
              </div>

              {errorMessage && (
                <div className="request-error" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <ol className="request-flow" aria-label="خطوات إرسال الطلب">
                  <li className={activeStep === 1 ? "is-active" : ""}>
                    <button
                      type="button"
                      className="flow-step-button"
                      onClick={() => openStep(1)}
                      aria-expanded={activeStep === 1}
                      aria-controls="request-step-name"
                    >
                      <span className="flow-number">١</span>
                      <span className="flow-copy">
                        <strong>من نخاطب؟</strong>
                        <small>
                          {nameConfirmed
                            ? customerName
                            : "اكتب اسمك للبدء"}
                        </small>
                      </span>
                      {nameConfirmed && (
                        <Check className="flow-check" size={18} aria-label="مكتمل" />
                      )}
                      <ArrowLeft className="flow-arrow" size={18} aria-hidden="true" />
                    </button>

                    {activeStep === 1 && (
                      <div className="flow-panel" id="request-step-name">
                        <label htmlFor="request-name">الاسم الكامل</label>
                        <div className="input-with-icon">
                          <UserRound size={18} aria-hidden="true" />
                          <input
                            id="request-name"
                            name="name"
                            value={customerName}
                            onChange={(event) => {
                              setCustomerName(event.target.value);
                              setNameConfirmed(false);
                              setContactConfirmed(false);
                            }}
                            placeholder="مثال: محمد أحمد"
                            autoComplete="name"
                            autoFocus
                            required
                          />
                        </div>
                        <small className="field-hint">
                          نستخدم الاسم فقط للتواصل بشأن طلبك.
                        </small>
                        {customerName.trim().length > 0 && (
                          <button
                            type="button"
                            className="request-button request-button-primary panel-action"
                            onClick={confirmName}
                            disabled={!validName}
                          >
                            موافق
                            <ArrowLeft size={17} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )}
                  </li>

                  <li className={activeStep === 2 ? "is-active" : ""}>
                    <button
                      type="button"
                      className="flow-step-button"
                      onClick={() => openStep(2)}
                      disabled={!nameConfirmed}
                      aria-expanded={activeStep === 2}
                      aria-controls="request-step-contact"
                    >
                      <span className="flow-number">٢</span>
                      <span className="flow-copy">
                        <strong>كيف نتواصل معك؟</strong>
                        <small>
                          {contactConfirmed
                            ? "تم حفظ رقم التواصل"
                            : "رقم WhatsApp بالمفتاح الدولي"}
                        </small>
                      </span>
                      {contactConfirmed && (
                        <Check className="flow-check" size={18} aria-label="مكتمل" />
                      )}
                      <ArrowLeft className="flow-arrow" size={18} aria-hidden="true" />
                    </button>

                    {activeStep === 2 && nameConfirmed && (
                      <div className="flow-panel" id="request-step-contact">
                        <div className="phone-fields">
                          <div>
                            <label htmlFor="country-code">مفتاح الدولة</label>
                            <input
                              id="country-code"
                              name="countryCode"
                              className="phone-input"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel-country-code"
                              value={countryCode}
                              onChange={(event) => {
                                setCountryCode(event.target.value);
                                setContactConfirmed(false);
                              }}
                              maxLength={4}
                              placeholder="+249"
                              aria-describedby="country-code-hint"
                              required
                            />
                            <small id="country-code-hint" className="field-hint">
                              مثال: +249 للسودان
                            </small>
                          </div>
                          <div>
                            <label htmlFor="whatsapp-number">رقم WhatsApp</label>
                            <input
                              id="whatsapp-number"
                              name="whatsappNumber"
                              className="phone-input"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel-national"
                              value={phoneNumber}
                              onChange={(event) => {
                                setPhoneNumber(event.target.value);
                                setContactConfirmed(false);
                              }}
                              placeholder="912345678"
                              aria-describedby="phone-number-hint"
                              required
                            />
                            <small id="phone-number-hint" className="field-hint">
                              الرقم المحلي فقط، ويمكن كتابته مع الصفر الأول
                            </small>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="request-button request-button-primary panel-action"
                          onClick={confirmContact}
                          disabled={!validPhone}
                        >
                          موافق
                          <ArrowLeft size={17} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </li>

                  <li className={activeStep === 3 ? "is-active" : ""}>
                    <button
                      type="button"
                      className="flow-step-button"
                      onClick={() => openStep(3)}
                      disabled={!contactConfirmed}
                      aria-expanded={activeStep === 3}
                      aria-controls="request-step-details"
                    >
                      <span className="flow-number">٣</span>
                      <span className="flow-copy">
                        <strong>ما الخدمة المطلوبة؟</strong>
                        <small>
                          {serviceName === "طلب مخصص"
                            ? "اختر الخدمة واكتب التفاصيل"
                            : serviceName}
                        </small>
                      </span>
                      <ArrowLeft className="flow-arrow" size={18} aria-hidden="true" />
                    </button>

                    {activeStep === 3 && contactConfirmed && (
                      <div className="flow-panel" id="request-step-details">
                        <div className="field-group">
                          <label htmlFor="request-service">الخدمة المطلوبة</label>
                          <select
                            id="request-service"
                            name="service"
                            value={serviceName}
                            onChange={(event) => setServiceName(event.target.value)}
                          >
                            {serviceOptions.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field-group">
                          <label htmlFor="request-details">تفاصيل ومتطلبات الطلب</label>
                          <textarea
                            id="request-details"
                            name="details"
                            value={details}
                            onChange={(event) => setDetails(event.target.value)}
                            placeholder="ما الذي تريد إنجازه؟ اذكر المواصفات أو الموعد أو أي ملاحظة مهمة."
                            required
                          />
                        </div>
                        <div className="file-note">
                          <FileText size={17} aria-hidden="true" />
                          <span>
                            لا يتم رفع الملفات من هذا النموذج. إذا احتاج طلبك
                            ملفات، أرسلها بعد الإرسال عبر WhatsApp.
                          </span>
                        </div>
                        <button
                          className="request-button request-button-submit panel-action"
                          type="submit"
                          disabled={submitting || !validDetails}
                        >
                          {submitting ? (
                            <span className="loading-label" role="status">
                              جاري إرسال الطلب...
                            </span>
                          ) : (
                            <>
                              <Send size={18} aria-hidden="true" />
                              إرسال الطلب الآن
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </li>
                </ol>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}