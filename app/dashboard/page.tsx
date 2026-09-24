"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { getAllRequests, type ServiceRequest } from "@/lib/supabase";

export default function Dashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllRequests();
      setRequests(res.requests);
    } catch {
      // fallback handled inside getAllRequests
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
            <Link href="/request" className="nav-cta">
              طلب جديد
            </Link>
          </nav>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          <div className="dashboard-head">
            <div>
              <h1>حساب العميل</h1>
              <p>متابعة طلباتك ومراحل تنفيذها خطوة بخطوة.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={fetchCustomerRequests}
                className="btn btn-light"
                title="تحديث القائمة"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
              </button>
              <Link href="/request" className="btn btn-primary">
                <Plus size={16} /> طلب جديد
              </Link>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <small>إجمالي الطلبات</small>
              <strong>{requests.length}</strong>
            </div>
            <div className="stat">
              <small>طلبات جديدة</small>
              <strong style={{ color: "#d97706" }}>
                {requests.filter((x) => x.status === "جديد").length}
              </strong>
            </div>
            <div className="stat">
              <small>قيد التنفيذ</small>
              <strong style={{ color: "#0284c7" }}>
                {requests.filter((x) => x.status === "قيد التنفيذ").length}
              </strong>
            </div>
            <div className="stat">
              <small>تم التسليم</small>
              <strong style={{ color: "#16a34a" }}>
                {requests.filter((x) => x.status === "تم التسليم").length}
              </strong>
            </div>
          </div>

          <div className="table-card">
            {loading ? (
              <div className="empty">جاري تحميل بيانات الطلبات...</div>
            ) : requests.length === 0 ? (
              <div className="empty">
                لا توجد طلبات حتى الآن.
                <br />
                <Link href="/request" className="card-link" style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  ابدأ أول طلب لك الآن ←
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>الخدمة</th>
                      <th>التاريخ</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td className="request-id" style={{ fontFamily: "monospace" }}>
                          {r.id}
                        </td>
                        <td>
                          <strong>{r.service}</strong>
                        </td>
                        <td style={{ color: "#64748b", fontSize: "13px" }}>
                          {new Date(r.date).toLocaleDateString("ar-SD")}
                        </td>
                        <td>
                          <span
                            className="status"
                            style={{
                              background:
                                r.status === "تم التسليم"
                                  ? "#dcfce7"
                                  : r.status === "قيد التنفيذ"
                                  ? "#e0f2fe"
                                  : r.status === "جديد"
                                  ? "#fef9c3"
                                  : "#eff6ff",
                              color:
                                r.status === "تم التسليم"
                                  ? "#15803d"
                                  : r.status === "قيد التنفيذ"
                                  ? "#0369a1"
                                  : r.status === "جديد"
                                  ? "#854d0e"
                                  : "#1d4ed8",
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
