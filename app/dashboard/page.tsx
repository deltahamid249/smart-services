"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getRequestByTrackingToken,
  type ServiceRequest,
} from "@/lib/supabase";

function statusLabel(status: string) {
  switch (status) {
    case "new":
      return "طلب جديد";
    case "in_progress":
      return "قيد التنفيذ";
    case "completed":
      return "مكتمل";
    case "cancelled":
      return "ملغي";
    default:
      return status || "غير محدد";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "completed":
      return "status completed";
    case "in_progress":
      return "status progress";
    case "cancelled":
      return "status cancelled";
    default:
      return "status pending";
  }
}

function formatDate(date?: string) {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("ar-SD", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export default function Dashboard() {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";

    const params = new URLSearchParams(window.location.search);
    return (
      params.get("token") ||
      sessionStorage.getItem("smart_current_tracking_token") ||
      ""
    );
  });
  const [request, setRequest] =
    useState<ServiceRequest | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const loadRequest = async (
    trackingToken: string
  ) => {
    const cleanToken = trackingToken.trim();

    if (!cleanToken) {
      setRequest(null);
      setError(
        "أدخل رمز المتابعة الخاص بطلبك."
      );
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const result =
        await getRequestByTrackingToken(
          cleanToken
        );

      if (!result.request) {
        setRequest(null);
        setError(
          "لم يتم العثور على طلب بهذا الرمز. تأكد من إدخال رمز المتابعة بشكل صحيح."
        );
        return;
      }

      setRequest(result.request);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "smart_current_tracking_token",
          cleanToken
        );
      }
    } catch (err) {
      console.error(
        "Failed to load request:",
        err
      );

      setRequest(null);
      setError(
        err instanceof Error
          ? err.message
          : "تعذر جلب بيانات الطلب. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const urlToken =
      params.get("token") || "";

    const savedToken =
      sessionStorage.getItem(
        "smart_current_tracking_token"
      ) || "";

    const initialToken =
      urlToken || savedToken;

    if (initialToken) {
      const timer = setTimeout(() => {
        loadRequest(initialToken);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    loadRequest(token);
  };

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

            <Link href="/request">
              طلب خدمة
            </Link>

            <Link
              href="/dashboard"
              className="active"
            >
              متابعة الطلب
            </Link>
          </nav>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          <div
            className="form-wrap"
            style={{
              maxWidth: "760px",
              margin: "40px auto",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              <span className="badge">
                متابعة الطلب
              </span>

              <h1
                style={{
                  fontSize: "28px",
                  marginTop: "12px",
                }}
              >
                تابع حالة طلبك
              </h1>

              <p className="form-sub">
                أدخل رمز المتابعة الذي ظهر لك بعد
                إرسال الطلب لعرض تفاصيله وحالته.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "stretch",
                marginBottom: "20px",
              }}
            >
              <input
                value={token}
                onChange={(event) =>
                  setToken(event.target.value)
                }
                placeholder="ألصق رمز المتابعة هنا"
                dir="ltr"
                autoComplete="off"
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "left",
                  fontFamily: "monospace",
                }}
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  minWidth: "120px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="spin"
                    />
                    جاري البحث
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    متابعة
                  </>
                )}
              </button>
            </form>

            {error && (
              <div
                className="notice"
                style={{
                  border:
                    "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#991b1b",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <AlertCircle
                  size={20}
                  style={{
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />

                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#64748b",
                }}
              >
                <Loader2
                  size={32}
                  className="spin"
                  style={{
                    marginBottom: "10px",
                  }}
                />

                <p>
                  جاري تحميل بيانات طلبك...
                </p>
              </div>
            )}

            {!loading && request && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "22px",
                      }}
                    >
                      تفاصيل الطلب
                    </h2>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      تاريخ الطلب:{" "}
                      {formatDate(
                        request.date
                      )}
                    </p>
                  </div>

                  <span
                    className={statusClass(
                      request.status
                    )}
                  >
                    {statusLabel(
                      request.status
                    )}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        marginBottom: "5px",
                      }}
                    >
                      رقم الطلب
                    </div>

                    <strong
                      style={{
                        fontFamily:
                          "monospace",
                        direction: "ltr",
                        display: "block",
                        textAlign: "left",
                        wordBreak:
                          "break-all",
                      }}
                    >
                      {request.id}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        marginBottom: "5px",
                      }}
                    >
                      الخدمة المطلوبة
                    </div>

                    <strong>
                      {request.service}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        marginBottom: "5px",
                      }}
                    >
                      تاريخ إرسال الطلب
                    </div>

                    <strong>
                      {formatDate(
                        request.date
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: "12px",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        marginBottom: "8px",
                      }}
                    >
                      تفاصيل الطلب
                    </div>

                    <p
                      style={{
                        margin: 0,
                        lineHeight: "1.9",
                        whiteSpace:
                          "pre-wrap",
                        color: "#334155",
                      }}
                    >
                      {request.details ||
                        "لا توجد تفاصيل إضافية."}
                    </p>
                  </div>

                  {request.admin_notes && (
                    <div
                      style={{
                        padding: "16px",
                        border:
                          "1px solid #bfdbfe",
                        borderRadius: "12px",
                        background: "#eff6ff",
                      }}
                    >
                      <div
                        style={{
                          color: "#1d4ed8",
                          fontSize: "13px",
                          fontWeight: 600,
                          marginBottom:
                            "8px",
                        }}
                      >
                        ملاحظات الإدارة
                      </div>

                      <p
                        style={{
                          margin: 0,
                          lineHeight: "1.9",
                          whiteSpace:
                            "pre-wrap",
                        }}
                      >
                        {request.admin_notes}
                      </p>
                    </div>
                  )}

                  {request.final_file_url && (
                    <a
                      href={
                        request.final_file_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      تحميل الملف النهائي
                    </a>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "22px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      loadRequest(token)
                    }
                    className="btn btn-light"
                    disabled={loading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <RefreshCw size={17} />
                    تحديث الحالة
                  </button>

                  <Link
                    href="/request"
                    className="btn btn-primary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <Plus size={17} />
                    طلب خدمة جديدة
                  </Link>
                </div>
              </div>
            )}

            {!loading &&
              !request &&
              !error &&
              searched && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 15px",
                    color: "#64748b",
                  }}
                >
                  <Clock3
                    size={32}
                    style={{
                      marginBottom: "10px",
                    }}
                  />

                  <p>
                    أدخل رمز المتابعة لعرض طلبك.
                  </p>
                </div>
              )}

            {!loading &&
              !searched && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "25px 15px",
                    color: "#64748b",
                  }}
                >
                  <CheckCircle2
                    size={32}
                    style={{
                      marginBottom: "10px",
                    }}
                  />

                  <p>
                    رمز المتابعة هو المفتاح الخاص
                    بالوصول إلى طلبك.
                  </p>
                </div>
              )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          form {
            flex-direction: column;
          }

          form button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
