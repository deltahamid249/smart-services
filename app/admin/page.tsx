"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RequestItem = {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  details: string;
  date: string;
  status: string;
};

export default function Admin() {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("smart_requests");

    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch {
        setRequests([]);
      }
    }
  }, []);

  const updateStatus = (id: string, status: string) => {
    const updated = requests.map((request) =>
      request.id === id ? { ...request, status } : request
    );

    setRequests(updated);
    localStorage.setItem("smart_requests", JSON.stringify(updated));
  };

  const openWhatsApp = (request: RequestItem) => {
    const phone = request.whatsapp.replace(/\D/g, "");

    const message =
      `مرحبًا ${request.name}،\n\n` +
      `بخصوص طلبك رقم: ${request.id}\n` +
      `الخدمة: ${request.service}\n` +
      `حالة الطلب: ${request.status}\n\n` +
      `الحلول التقنية الذكية`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const newCount = requests.filter(
    (request) => request.status === "جديد"
  ).length;

  const workingCount = requests.filter(
    (request) => request.status === "قيد التنفيذ"
  ).length;

  const deliveredCount = requests.filter(
    (request) => request.status === "تم التسليم"
  ).length;

  return (
    <>
      <header className="header">
        <div className="container nav">
          <Link href="/" className="logo">
            الحلول <span>التقنية الذكية</span>
          </Link>

          <nav className="navlinks">
            <Link href="/">الموقع</Link>
            <Link href="/request">طلب جديد</Link>
          </nav>
        </div>
      </header>

      <main className="dashboard">
        <div className="container">
          <div className="dashboard-head">
            <div>
              <h1>لوحة الإدارة</h1>
              <p>إدارة الطلبات ومتابعة مراحل التنفيذ.</p>
            </div>

            <Link href="/request" className="btn btn-primary">
              + طلب جديد
            </Link>
          </div>

          <div className="stats">
            <div className="stat">
              <small>كل الطلبات</small>
              <strong>{requests.length}</strong>
            </div>

            <div className="stat">
              <small>طلبات جديدة</small>
              <strong>{newCount}</strong>
            </div>

            <div className="stat">
              <small>قيد التنفيذ</small>
              <strong>{workingCount}</strong>
            </div>

            <div className="stat">
              <small>تم التسليم</small>
              <strong>{deliveredCount}</strong>
            </div>
          </div>

          <div className="table-card">
            {requests.length === 0 ? (
              <div className="empty">
                لا توجد طلبات حاليًا.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>WhatsApp</th>
                    <th>الخدمة</th>
                    <th>الحالة</th>
                    <th>التواصل</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="request-id">
                        {request.id}
                      </td>

                      <td>{request.name}</td>

                      <td>{request.whatsapp}</td>

                      <td>{request.service}</td>

                      <td>
                        <select
                          value={request.status}
                          onChange={(event) =>
                            updateStatus(
                              request.id,
                              event.target.value
                            )
                          }
                        >
                          <option>جديد</option>
                          <option>قيد المراجعة</option>
                          <option>
                            بانتظار معلومات من العميل
                          </option>
                          <option>قيد التنفيذ</option>
                          <option>جاهز للتسليم</option>
                          <option>تم التسليم</option>
                          <option>مغلق</option>
                        </select>
                      </td>

                      <td>
                        <button
                          className="btn whatsapp"
                          onClick={() =>
                            openWhatsApp(request)
                          }
                        >
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
