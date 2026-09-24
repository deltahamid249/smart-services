"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "24px", color: "#0f172a", marginBottom: "12px" }}>
            حدث خطأ غير متوقع
          </h2>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            نعتذر عن هذا الخطأ المؤقت، يرجى إعادة المحاولة.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
