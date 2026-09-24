"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Database,
  KeyRound,
  LogOut,
  MessageCircle,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Copy,
  Check,
  Settings,
  Layers,
  FileSpreadsheet,
  Bell,
  BellOff,
  Radio,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  getAllRequests,
  updateRequestStatusAndNotes,
  deleteServiceRequest,
  createServiceRequest,
  testSupabaseConnection,
  saveSupabaseConfig,
  getStoredSupabaseConfig,
  subscribeToRealtimeRequests,
  playNotificationChime,
  type ServiceRequest,
} from "@/lib/supabase";
import {
  isCurrentAdminAuthenticated,
  logoutAdminUser,
  verifyAdminLogin,
  updateAdminCredentials,
  getAdminSession,
} from "@/lib/auth";

export default function AdminPage() {
  // Authentication State with Lazy Initializers
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return isCurrentAdminAuthenticated();
  });
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminName, setAdminName] = useState<string>(() => {
    if (typeof window === "undefined") return "المسؤول";
    return getAdminSession()?.username || "المسؤول";
  });

  // Requests Data State
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemoteDb, setIsRemoteDb] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);

  // Settings & Toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const s = localStorage.getItem("smart_sound_enabled");
    return s === null ? true : s === "true";
  });
  const [autoPolling, setAutoPolling] = useState(true);
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Notification Toast & Live Banner
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [latestIncomingAlert, setLatestIncomingAlert] = useState<ServiceRequest | null>(null);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [serviceFilter, setServiceFilter] = useState("الكل");

  // Modals
  const [activeModal, setActiveModal] = useState<
    "none" | "db-settings" | "change-pass" | "view-details" | "add-request" | "delete-confirm"
  >("none");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Database Settings Form with Lazy Initializers
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    return getStoredSupabaseConfig().url;
  });
  const [supabaseKey, setSupabaseKey] = useState<string>(() => {
    return getStoredSupabaseConfig().anonKey;
  });
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Change Password Form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");

  // Manual Add Request Form
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualService, setManualService] = useState("طلب مخصص");
  const [manualDetails, setManualDetails] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // Admin notes edit
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch requests from Supabase / Local
  const loadRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await getAllRequests();

      setRequests((prev) => {
        // Check if new request arrived silently during background polling
        if (silent && prev.length > 0) {
          const existingIds = new Set(prev.map((r) => r.id));
          const newlyFound = result.requests.find((r) => !existingIds.has(r.id));
          if (newlyFound) {
            if (soundEnabled) playNotificationChime();
            setLatestIncomingAlert(newlyFound);
            showToast(`🔔 طلب جديد وصل: ${newlyFound.name} (${newlyFound.service})`, "info");
          }
        }
        return result.requests;
      });

      setIsRemoteDb(result.isRemote);
    } catch (err) {
      console.error("Failed to load requests:", err);
      if (!silent) {
        showToast("تعذر تحميل البيانات، تم الرجوع للتخزين المحلي", "error");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [soundEnabled, showToast]);

  // Initial Load
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      loadRequests(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, loadRequests]);

  // Real-time listener: Supabase WebSockets + BroadcastChannel
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribeToRealtimeRequests({
      onNew: (newReq) => {
        // Prevent duplicate if already in state
        setRequests((prev) => {
          if (prev.some((r) => r.id === newReq.id)) return prev;
          return [newReq, ...prev];
        });

        // Trigger chime sound
        if (soundEnabled) {
          playNotificationChime();
        }

        // Show live alert banner
        setLatestIncomingAlert(newReq);
        showToast(`🔔 طلب جديد وصل الآن من ${newReq.name}!`, "info");
      },
      onUpdate: (updatedReq) => {
        setRequests((prev) =>
          prev.map((r) => (r.id === updatedReq.id ? { ...r, ...updatedReq } : r))
        );
      },
      onDelete: () => {
        loadRequests(true);
      },
    });

    return () => {
      unsubscribe();
      setRealtimeActive(false);
    };
  }, [isAuthenticated, soundEnabled, loadRequests, showToast]);

  // Fallback Polling every 12 seconds
  useEffect(() => {
    if (!isAuthenticated || !autoPolling) return;
    const interval = setInterval(() => {
      loadRequests(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoPolling, loadRequests]);

  // Handle Admin Login
  const handleInlineLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const res = verifyAdminLogin(loginUser, loginPass);
    if (res.success) {
      setIsAuthenticated(true);
      const session = getAdminSession();
      if (session?.username) setAdminName(session.username);
      showToast("مرحباً بك! تم تسجيل الدخول بنجاح", "success");
    } else {
      setLoginError(res.error || "اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    logoutAdminUser();
    setIsAuthenticated(false);
    showToast("تم تسجيل الخروج", "info");
  };

  // Toggle notification sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("smart_sound_enabled", String(next));
    if (next) {
      playNotificationChime();
      showToast("تم تفعيل التنبيه الصوتي للطلبات الجديدة 🔔", "info");
    } else {
      showToast("تم كتم التنبيه الصوتي 🔕", "info");
    }
  };

  // Update Status
  const handleStatusChange = async (id: string, newStatus: string) => {
    // optimistic update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    const res = await updateRequestStatusAndNotes(id, newStatus);
    if (res.success) {
      showToast(`تم تحديث حالة الطلب إلى "${newStatus}" بنجاح`, "success");
    } else {
      showToast(`فشل التحديث في قاعدة البيانات: ${res.error}`, "error");
      loadRequests(true);
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    setSavingNotes(true);
    const res = await updateRequestStatusAndNotes(
      selectedRequest.id,
      selectedRequest.status,
      editNotes
    );
    setSavingNotes(false);
    if (res.success) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, admin_notes: editNotes } : r
        )
      );
      setSelectedRequest((prev) => (prev ? { ...prev, admin_notes: editNotes } : null));
      showToast("تم حفظ ملاحظات الإدارة بنجاح", "success");
    } else {
      showToast("حدث خطأ أثناء حفظ الملاحظات", "error");
    }
  };

  // Delete Request
  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    const idToDelete = selectedRequest.id;
    setActiveModal("none");

    setRequests((prev) => prev.filter((r) => r.id !== idToDelete));
    const res = await deleteServiceRequest(idToDelete);
    if (res.success) {
      showToast("تم حذف الطلب بنجاح", "success");
    } else {
      showToast(`فشل الحذف من قاعدة البيانات: ${res.error}`, "error");
      loadRequests(true);
    }
  };

  // Manual Add Request
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingManual(true);
    try {
      const res = await createServiceRequest({
        name: manualName,
        whatsapp: manualPhone,
        service: manualService,
        details: manualDetails,
      });

      if (res.success) {
        showToast("تمت إضافة الطلب بنجاح!", "success");
        setManualName("");
        setManualPhone("");
        setManualDetails("");
        setActiveModal("none");
        loadRequests(false);
      }
    } catch {
      showToast("حدث خطأ أثناء إضافة الطلب", "error");
    } finally {
      setSubmittingManual(false);
    }
  };

  // Save Database Settings
  const handleSaveDbSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setTestingDb(true);
    setDbTestResult(null);

    const result = await testSupabaseConnection();
    setTestingDb(false);
    setDbTestResult(result);

    if (result.success) {
      showToast("تم حفظ الإعدادات والاتصال بنجاح!", "success");
      loadRequests(false);
    } else {
      showToast(result.message, "error");
    }
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (newPass !== confirmPass) {
      setPassError("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    const res = updateAdminCredentials(currentPass, newPass);
    if (res.success) {
      showToast("تم تحديث كلمة المرور بنجاح!", "success");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setActiveModal("none");
    } else {
      setPassError(res.message);
    }
  };

  // Open WhatsApp with custom message
  const openWhatsApp = (request: ServiceRequest, template: "update" | "greeting" | "delivery" = "update") => {
    const cleanPhone = request.whatsapp.replace(/\D/g, "");
    let text = "";

    if (template === "greeting") {
      text = `مرحبًا ${request.name}،\nمعك إدارة منصة الحلول التقنية الذكية.\nاستلمنا طلبك رقم: ${request.id}\nالخدمة: ${request.service}\nوسنبدأ في مراجعته والتنفيذ.`;
    } else if (template === "delivery") {
      text = `مرحبًا ${request.name}،\nيسعدنا إبلاغك بأن طلبك رقم (${request.id}) الخاص بـ "${request.service}" جاهز ومكتمل الآن! 🚀\nالحلول التقنية الذكية.`;
    } else {
      text = `مرحبًا ${request.name}،\nبخصوص طلبك رقم: ${request.id}\nالخدمة: ${request.service}\nالحالة الحالية: [ ${request.status} ]\n\nالحلول التقنية الذكية`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      showToast("لا توجد طلبات للتصدير", "info");
      return;
    }

    const headers = ["رقم الطلب", "اسم العميل", "رقم WhatsApp", "الخدمة", "الحالة", "التاريخ", "التفاصيل", "ملاحظات الإدارة"];
    const rows = filteredRequests.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.whatsapp}"`,
      `"${r.service.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${new Date(r.date).toLocaleString("ar-SD")}"`,
      `"${r.details.replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${(r.admin_notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `طلبات_العملاء_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("تم تحميل ملف البيانات بنجاح", "success");
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.whatsapp.includes(searchTerm) ||
      r.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "الكل" || r.status === statusFilter;
    const matchService = serviceFilter === "الكل" || r.service === serviceFilter;

    return matchSearch && matchStatus && matchService;
  });

  // Statistics
  const stats = {
    total: requests.length,
    isNew: requests.filter((r) => r.status === "جديد").length,
    working: requests.filter((r) => r.status === "قيد التنفيذ" || r.status === "قيد المراجعة").length,
    ready: requests.filter((r) => r.status === "جاهز للتسليم").length,
    delivered: requests.filter((r) => r.status === "تم التسليم").length,
  };

  const sqlCode = `-- كود إنشاء جدول طلبات الخدمات وتفعيل البث اللحظي في Supabase
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  customer_name text not null,
  whatsapp text not null,
  service text not null,
  details text not null,
  status text not null default 'جديد',
  admin_notes text default '',
  final_file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table service_requests add column if not exists admin_notes text default '';
create index if not exists service_requests_created_idx on service_requests(created_at desc);
alter table service_requests enable row level security;

create policy "Allow public to insert requests" on service_requests for insert with check (true);
create policy "Allow public read access" on service_requests for select using (true);
create policy "Allow public update requests" on service_requests for update using (true);
create policy "Allow public delete requests" on service_requests for delete using (true);

-- تفعيل البث اللحظي الفوري لظهور الطلبات فور وصولها في لوحة الإدارة:
alter publication supabase_realtime add table service_requests;`;

  // --- Authentication Barrier ---
  if (!isAuthenticated) {
    return (
      <main className="auth">
        <div className="auth-box" style={{ width: "min(460px, 100%)" }}>
          <div className="auth-logo">
            <Link href="/" className="logo">
              الحلول <span>التقنية الذكية</span>
            </Link>
          </div>

          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h1 style={{ fontSize: "22px", textAlign: "center", marginBottom: "6px" }}>
            منطقة الإدارة المحمية
          </h1>
          <p className="form-sub" style={{ textAlign: "center", marginBottom: "22px" }}>
            هذه الصفحة تتطلب تسجيل الدخول بحساب مسؤول النظام للوصول إلى بيانات وطلبات العملاء.
          </p>

          {loginError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "12px 14px",
                borderRadius: "12px",
                marginBottom: "16px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleInlineLogin}>
            <div className="field">
              <label>اسم المستخدم</label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label>كلمة المرور</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "18px",
              }}
            >
              💡 <b>بيانات الدخول الافتراضية:</b>
              <br />
              المستخدم: <code>admin</code> | كلمة المرور: <code>Admin@Almnusaa2026!</code>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", height: "46px", fontSize: "15px" }}
            >
              تسجيل الدخول إلى لوحة الإدارة
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link href="/" style={{ color: "#64748b", fontSize: "14px" }}>
              ← العودة إلى الموقع
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- Main Admin Dashboard Screen ---
  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            zIndex: 9999,
            background: toast.type === "error" ? "#dc2626" : toast.type === "info" ? "#0284c7" : "#16a34a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 600,
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="header" style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div className="container nav" style={{ height: "70px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" className="logo">
              الحلول <span>التقنية الذكية</span>
            </Link>
            <span
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "3px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid #bfdbfe",
              }}
            >
              لوحة الإدارة
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Realtime Live Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                background: realtimeActive ? "#f0fdf4" : "#f8fafc",
                color: realtimeActive ? "#166534" : "#64748b",
                border: `1px solid ${realtimeActive ? "#bbf7d0" : "#e2e8f0"}`,
              }}
              title={realtimeActive ? "البث اللحظي الفوري متصل ويعمل" : "جاري الاتصال بالبث اللحظي"}
            >
              <Radio size={13} className={realtimeActive ? "pulse-anim" : ""} />
              <span className="hide-on-mobile">{realtimeActive ? "بث لحظي مباشر" : "متصل"}</span>
            </div>

            {/* Sound Notification Toggle */}
            <button
              onClick={toggleSound}
              className="btn btn-light"
              style={{ padding: "6px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
              title={soundEnabled ? "كتم صوت التنبيهات" : "تفعيل صوت التنبيهات"}
            >
              {soundEnabled ? <Bell size={15} color="#059669" /> : <BellOff size={15} color="#94a3b8" />}
              <span className="hide-on-mobile">{soundEnabled ? "صوت مفعّل" : "مكتوم"}</span>
            </button>

            {/* Auto Polling Toggle */}
            <button
              onClick={() => {
                const next = !autoPolling;
                setAutoPolling(next);
                showToast(next ? "تم تفعيل التحديث التلقائي 🟢" : "تم إيقاف التحديث التلقائي ⏸️", "info");
              }}
              className="btn btn-light"
              style={{ padding: "6px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
              title={autoPolling ? "إيقاف التحديث التلقائي" : "تشغيل التحديث التلقائي"}
            >
              <RefreshCw size={13} className={autoPolling ? "spin" : ""} color={autoPolling ? "#2563eb" : "#94a3b8"} />
              <span className="hide-on-mobile">{autoPolling ? "تحديث تلقائي" : "متوقف"}</span>
            </button>

            {/* Database Status Button */}
            <button
              onClick={() => setActiveModal("db-settings")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: isRemoteDb ? "#bbf7d0" : "#fef08a",
                background: isRemoteDb ? "#f0fdf4" : "#fefce8",
                color: isRemoteDb ? "#166534" : "#854d0e",
                cursor: "pointer",
              }}
              title="اضغط لضبط أو فحص إعدادات قاعدة بيانات Supabase"
            >
              <Database size={13} />
              <span className="hide-on-mobile">{isRemoteDb ? "Supabase متصل" : "تخزين محلي"}</span>
            </button>

            {/* Change Password */}
            <button
              onClick={() => setActiveModal("change-pass")}
              className="btn btn-light"
              style={{ padding: "6px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
              title="أمان الحساب وتغيير كلمة المرور"
            >
              <KeyRound size={14} />
              <span className="hide-on-mobile">أمان الحساب</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                padding: "6px 10px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="تسجيل الخروج"
            >
              <LogOut size={14} />
              <span className="hide-on-mobile">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard" style={{ padding: "24px 0 60px" }}>
        <div className="container">
          {/* Latest Incoming Order Realtime Alert Banner */}
          {latestIncomingAlert && (
            <div
              style={{
                background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
                color: "#ffffff",
                borderRadius: "16px",
                padding: "16px 20px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
                animation: "slideIn 0.3s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={22} color="#ffffff" className="pulse-anim" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "16px" }}>🔔 وصل طلب جديد الآن في هذه اللحظة!</strong>
                    <span
                      style={{
                        background: "#22c55e",
                        color: "#ffffff",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      فوري
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "2px" }}>
                    العميل: <b>{latestIncomingAlert.name}</b> • الخدمة المطلوبة: <b>{latestIncomingAlert.service}</b> (رقم: {latestIncomingAlert.id})
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => {
                    setSelectedRequest(latestIncomingAlert);
                    setEditNotes(latestIncomingAlert.admin_notes || "");
                    setActiveModal("view-details");
                  }}
                  className="btn"
                  style={{
                    background: "#ffffff",
                    color: "#1e40af",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "7px 14px",
                  }}
                >
                  عرض تفاصيل الطلب
                </button>
                <button
                  onClick={() => setLatestIncomingAlert(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ffffff",
                    cursor: "pointer",
                    padding: "6px",
                  }}
                  title="إغلاق التنبيه"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Top Title & Quick Actions */}
          <div className="dashboard-head" style={{ marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
            <div>
              <h1 style={{ fontSize: "26px", color: "#0f172a" }}>لوحة تحكم إدارة الطلبات</h1>
              <p style={{ color: "#64748b", fontSize: "13px", marginTop: "3px" }}>
                مرحباً {adminName} • يتم استقبال ومزامنة جميع طلبات العملاء فورياً مع التحديث اللحظي وإمكانية التحكم الكاملة.
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              {/* View Mode Toggle */}
              <div
                style={{
                  display: "flex",
                  background: "#e2e8f0",
                  borderRadius: "10px",
                  padding: "2px",
                }}
              >
                <button
                  onClick={() => setViewMode("table")}
                  style={{
                    border: "none",
                    background: viewMode === "table" ? "#ffffff" : "transparent",
                    color: viewMode === "table" ? "#0f172a" : "#64748b",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="عرض كجدول بيانات"
                >
                  <List size={14} /> جدول
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  style={{
                    border: "none",
                    background: viewMode === "cards" ? "#ffffff" : "transparent",
                    color: viewMode === "cards" ? "#0f172a" : "#64748b",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="عرض كبطاقات متجاوبة"
                >
                  <LayoutGrid size={14} /> بطاقات
                </button>
              </div>

              <button
                onClick={() => setActiveModal("add-request")}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
              >
                <Plus size={16} />
                إضافة طلب جديد
              </button>

              <button
                onClick={exportToCSV}
                className="btn btn-light"
                style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}
                title="تصدير الطلبات المعروضة إلى ملف Excel"
              >
                <FileSpreadsheet size={15} color="#059669" />
                تصدير Excel
              </button>

              <button
                onClick={() => loadRequests(false)}
                className="btn btn-light"
                style={{ padding: "8px 12px" }}
                title="تحديث البيانات يدويًا"
                disabled={loading}
              >
                <RefreshCw size={15} className={loading ? "spin" : ""} />
              </button>
            </div>
          </div>

          {/* Database Setup Notice Banner (if local mode) */}
          {!isRemoteDb && (
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "14px",
                padding: "14px 18px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Database size={20} color="#b45309" />
                <div>
                  <strong style={{ color: "#92400e", fontSize: "14px" }}>
                    تعمل الصفحة حالياً في وضع التخزين المحلي الاحتياطي!
                  </strong>
                  <p style={{ color: "#b45309", fontSize: "12px", marginTop: "2px" }}>
                    لربط قاعدة بيانات Supabase المركزية ومزامنة جميع طلبات العملاء من مختلف الأجهزة فورياً على Cloudflare، اضغط للربط.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal("db-settings")}
                className="btn"
                style={{
                  background: "#d97706",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "7px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Settings size={14} />
                ربط Supabase الآن
              </button>
            </div>
          )}

          {/* Stats Counters */}
          <div className="stats">
            <div className="stat" style={{ borderRight: "4px solid #2563eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small>إجمالي الطلبات</small>
                <Layers size={18} color="#2563eb" />
              </div>
              <strong style={{ color: "#0f172a" }}>{stats.total}</strong>
            </div>

            <div className="stat" style={{ borderRight: "4px solid #f59e0b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small>طلبات جديدة</small>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#f59e0b",
                    boxShadow: "0 0 8px #f59e0b",
                  }}
                />
              </div>
              <strong style={{ color: "#d97706" }}>{stats.isNew}</strong>
            </div>

            <div className="stat" style={{ borderRight: "4px solid #0284c7" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small>قيد التنفيذ / المراجعة</small>
                <Clock size={18} color="#0284c7" />
              </div>
              <strong style={{ color: "#0284c7" }}>{stats.working}</strong>
            </div>

            <div className="stat" style={{ borderRight: "4px solid #16a34a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small>تم التسليم</small>
                <CheckCircle size={18} color="#16a34a" />
              </div>
              <strong style={{ color: "#16a34a" }}>{stats.delivered}</strong>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div
            className="filter-bar"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الطلب، اسم العميل، الهاتف، التفاصيل..."
                style={{
                  width: "100%",
                  paddingRight: "36px",
                  paddingLeft: "12px",
                  height: "40px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={15} color="#64748b" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  padding: "0 10px",
                  fontSize: "13px",
                }}
              >
                <option value="الكل">كل الحالات ({requests.length})</option>
                <option value="جديد">جديد</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="بانتظار معلومات من العميل">بانتظار معلومات</option>
                <option value="قيد التنفيذ">قيد التنفيذ</option>
                <option value="جاهز للتسليم">جاهز للتسليم</option>
                <option value="تم التسليم">تم التسليم</option>
                <option value="مغلق">مغلق</option>
              </select>
            </div>

            {/* Service Filter */}
            <div>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  padding: "0 10px",
                  fontSize: "13px",
                }}
              >
                <option value="الكل">جميع الخدمات</option>
                <option value="طلب مخصص">طلب مخصص</option>
                <option value="التصميم الجرافيكي">التصميم الجرافيكي</option>
                <option value="المواقع الإلكترونية">المواقع الإلكترونية</option>
                <option value="تطبيقات الهاتف">تطبيقات الهاتف</option>
                <option value="الملفات والمستندات">الملفات والمستندات</option>
                <option value="Excel وقواعد البيانات">Excel وقواعد البيانات</option>
                <option value="البرمجة والحلول التقنية">البرمجة والحلول التقنية</option>
                <option value="الاستضافة والنشر">الاستضافة والنشر</option>
                <option value="الخدمات الأكاديمية التقنية">الخدمات الأكاديمية</option>
              </select>
            </div>
          </div>

          {/* Requests Content Area (Supports Table & Responsive Card View) */}
          {loading ? (
            <div className="table-card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <RefreshCw className="spin" size={32} color="#2563eb" style={{ margin: "auto" }} />
              <p style={{ marginTop: "12px", color: "#64748b" }}>جاري مزامنة وجلب الطلبات...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="table-card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "16px" }}>
                {searchTerm || statusFilter !== "الكل" || serviceFilter !== "الكل"
                  ? "لا توجد نتائج تطابق معايير البحث أو التصفية المحددة."
                  : "لا توجد أي طلبات مسجلة حالياً."}
              </p>
              {(searchTerm || statusFilter !== "الكل" || serviceFilter !== "الكل") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("الكل");
                    setServiceFilter("الكل");
                  }}
                  className="btn btn-light"
                  style={{ fontSize: "13px" }}
                >
                  إعادة تعيين الفلاتر
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 1. Responsive Card View (Ideal for Smartphones and Tablets) */}
              <div className={`cards-view ${viewMode === "table" ? "force-hidden-desktop" : ""}`}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                  {filteredRequests.map((request) => {
                    const isNew = request.status === "جديد";
                    const isWorking = request.status === "قيد التنفيذ";
                    const isDone = request.status === "تم التسليم";
                    const isExpanded = expandedCardId === request.id;

                    return (
                      <div
                        key={request.id}
                        style={{
                          background: "#ffffff",
                          border: isNew ? "2px solid #fde047" : "1px solid #e2e8f0",
                          borderRadius: "16px",
                          padding: "16px",
                          boxShadow: isNew ? "0 4px 15px rgba(234, 179, 8, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                          position: "relative",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Header: ID + Date */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                padding: "4px 8px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                fontWeight: 700,
                              }}
                            >
                              {request.id}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(request.id);
                                showToast("تم نسخ رقم الطلب", "info");
                              }}
                              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                              title="نسخ رقم الطلب"
                            >
                              <Copy size={13} />
                            </button>
                          </div>

                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {new Date(request.date).toLocaleDateString("ar-SD", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Customer & Service Info */}
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <h3 style={{ fontSize: "17px", color: "#0f172a", marginBottom: "4px" }}>
                              {request.name}
                            </h3>
                            <span
                              style={{
                                background: "#f1f5f9",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                color: "#334155",
                                fontWeight: 600,
                              }}
                            >
                              {request.service}
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/${request.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#16a34a",
                              fontSize: "13px",
                              fontFamily: "monospace",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <MessageCircle size={14} />
                            <span dir="ltr">{request.whatsapp}</span>
                          </a>
                        </div>

                        {/* Status Changer */}
                        <div style={{ marginBottom: "12px" }}>
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusChange(request.id, e.target.value)}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: 700,
                              border: "1px solid",
                              borderColor: isNew ? "#fde047" : isWorking ? "#7dd3fc" : isDone ? "#86efac" : "#cbd5e1",
                              background: isNew ? "#fef9c3" : isWorking ? "#e0f2fe" : isDone ? "#dcfce7" : "#f8fafc",
                              color: isNew ? "#854d0e" : isWorking ? "#0369a1" : isDone ? "#15803d" : "#334155",
                              cursor: "pointer",
                            }}
                          >
                            <option value="جديد">جديد 🔔</option>
                            <option value="قيد المراجعة">قيد المراجعة 🔍</option>
                            <option value="بانتظار معلومات من العميل">بانتظار معلومات ⏳</option>
                            <option value="قيد التنفيذ">قيد التنفيذ ⚙️</option>
                            <option value="جاهز للتسليم">جاهز للتسليم 📦</option>
                            <option value="تم التسليم">تم التسليم ✅</option>
                            <option value="مغلق">مغلق 🔒</option>
                          </select>
                        </div>

                        {/* Details Preview / Expandable */}
                        <div
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                            borderRadius: "10px",
                            padding: "10px",
                            fontSize: "13px",
                            color: "#334155",
                            marginBottom: "12px",
                            lineHeight: "1.5",
                          }}
                        >
                          <div
                            style={{
                              maxHeight: isExpanded ? "none" : "48px",
                              overflow: "hidden",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {request.details}
                          </div>
                          {request.details.length > 70 && (
                            <button
                              onClick={() => setExpandedCardId(isExpanded ? null : request.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#2563eb",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                marginTop: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              {isExpanded ? (
                                <>عرض أقل <ChevronUp size={12} /></>
                              ) : (
                                <>عرض كامل التفاصيل <ChevronDown size={12} /></>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Admin Notes Indicator */}
                        {request.admin_notes && (
                          <div
                            style={{
                              background: "#ecfdf5",
                              border: "1px solid #d1fae5",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              fontSize: "11px",
                              color: "#065f46",
                              marginBottom: "12px",
                            }}
                          >
                            📝 <b>ملاحظات الإدارة:</b> {request.admin_notes}
                          </div>
                        )}

                        {/* Actions Row */}
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => openWhatsApp(request, "update")}
                            className="btn"
                            style={{
                              flex: 1,
                              background: "#22c55e",
                              color: "#fff",
                              padding: "7px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </button>

                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setEditNotes(request.admin_notes || "");
                              setActiveModal("view-details");
                            }}
                            className="btn btn-light"
                            style={{ padding: "7px 12px", borderRadius: "8px", fontSize: "12px" }}
                            title="تفاصيل وملاحظات"
                          >
                            <Eye size={15} color="#2563eb" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setActiveModal("delete-confirm");
                            }}
                            className="btn"
                            style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              border: "none",
                              padding: "7px 12px",
                              borderRadius: "8px",
                            }}
                            title="حذف الطلب"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Desktop Table View */}
              <div className={`table-card table-view ${viewMode === "cards" ? "force-hidden" : ""}`} style={{ marginTop: "10px" }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: "130px" }}>رقم الطلب</th>
                        <th>العميل</th>
                        <th>رقم WhatsApp</th>
                        <th>الخدمة</th>
                        <th>التاريخ</th>
                        <th style={{ minWidth: "160px" }}>حالة الطلب</th>
                        <th style={{ minWidth: "160px", textAlign: "center" }}>إجراءات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRequests.map((request) => {
                        const isNew = request.status === "جديد";
                        const isWorking = request.status === "قيد التنفيذ";
                        const isDone = request.status === "تم التسليم";

                        return (
                          <tr
                            key={request.id}
                            style={{
                              background: isNew ? "#fefce8" : undefined,
                              transition: "background 0.2s",
                            }}
                          >
                            {/* Request ID */}
                            <td className="request-id" style={{ fontFamily: "monospace", fontSize: "13px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>{request.id}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(request.id);
                                    showToast("تم نسخ رقم الطلب", "info");
                                  }}
                                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                                  title="نسخ رقم الطلب"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            </td>

                            {/* Customer Name */}
                            <td>
                              <strong style={{ color: "#0f172a" }}>{request.name}</strong>
                              {request.admin_notes && (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#059669",
                                    marginTop: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <span>📝 ملاحظات محفوظة</span>
                                </div>
                              )}
                            </td>

                            {/* WhatsApp */}
                            <td dir="ltr" style={{ textAlign: "right", fontFamily: "monospace" }}>
                              <a
                                href={`https://wa.me/${request.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#16a34a", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                <MessageCircle size={14} />
                                {request.whatsapp}
                              </a>
                            </td>

                            {/* Service */}
                            <td>
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  color: "#334155",
                                  fontWeight: 500,
                                }}
                              >
                                {request.service}
                              </span>
                            </td>

                            {/* Date */}
                            <td style={{ fontSize: "12px", color: "#64748b" }}>
                              {new Date(request.date).toLocaleDateString("ar-SD", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            {/* Status Selector */}
                            <td>
                              <select
                                value={request.status}
                                onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  border: "1px solid",
                                  borderColor: isNew
                                    ? "#fde047"
                                    : isWorking
                                    ? "#7dd3fc"
                                    : isDone
                                    ? "#86efac"
                                    : "#cbd5e1",
                                  background: isNew
                                    ? "#fef9c3"
                                    : isWorking
                                    ? "#e0f2fe"
                                    : isDone
                                    ? "#dcfce7"
                                    : "#f8fafc",
                                  color: isNew
                                    ? "#854d0e"
                                    : isWorking
                                    ? "#0369a1"
                                    : isDone
                                    ? "#15803d"
                                    : "#334155",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="جديد">جديد 🔔</option>
                                <option value="قيد المراجعة">قيد المراجعة 🔍</option>
                                <option value="بانتظار معلومات من العميل">بانتظار معلومات ⏳</option>
                                <option value="قيد التنفيذ">قيد التنفيذ ⚙️</option>
                                <option value="جاهز للتسليم">جاهز للتسليم 📦</option>
                                <option value="تم التسليم">تم التسليم ✅</option>
                                <option value="مغلق">مغلق 🔒</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button
                                  onClick={() => openWhatsApp(request, "update")}
                                  className="btn"
                                  style={{
                                    background: "#22c55e",
                                    color: "#fff",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                  title="مراسلة العميل بتحديث الحالة"
                                >
                                  <MessageCircle size={14} />
                                  <span>WhatsApp</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setEditNotes(request.admin_notes || "");
                                    setActiveModal("view-details");
                                  }}
                                  className="btn btn-light"
                                  style={{ padding: "6px 9px", borderRadius: "8px" }}
                                  title="عرض التفاصيل والملاحظات"
                                >
                                  <Eye size={15} color="#2563eb" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setActiveModal("delete-confirm");
                                  }}
                                  className="btn"
                                  style={{
                                    background: "#fee2e2",
                                    color: "#b91c1c",
                                    border: "none",
                                    padding: "6px 9px",
                                    borderRadius: "8px",
                                  }}
                                  title="حذف الطلب"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. Modal: View Request Details & Edit Admin Notes */}
      {activeModal === "view-details" && selectedRequest && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Eye size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px" }}>تفاصيل الطلب: {selectedRequest.id}</h2>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    تاريخ الطلب: {new Date(selectedRequest.date).toLocaleString("ar-SD")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                <div>
                  <small style={{ color: "#64748b" }}>اسم العميل</small>
                  <p style={{ fontWeight: 700, fontSize: "15px" }}>{selectedRequest.name}</p>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>رقم WhatsApp</small>
                  <p style={{ fontWeight: 700, fontSize: "15px", direction: "ltr", textAlign: "right" }}>
                    {selectedRequest.whatsapp}
                  </p>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>الخدمة</small>
                  <p style={{ fontWeight: 700, color: "#2563eb" }}>{selectedRequest.service}</p>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>الحالة الحالية</small>
                  <p style={{ fontWeight: 700 }}>{selectedRequest.status}</p>
                </div>
              </div>

              <div>
                <small style={{ color: "#64748b" }}>تفاصيل ومتطلبات العميل:</small>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    padding: "12px",
                    borderRadius: "8px",
                    marginTop: "6px",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedRequest.details}
                </div>
              </div>
            </div>

            {/* Admin Notes Section */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}>
                📝 ملاحظات الإدارة والمتابعة (داخلية للمسؤولين فقط):
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="أدخل أي ملاحظات حول السعر المتفق عليه، مراحل التنفيذ، ملفات التسليم، أو متطلبات إضافية..."
                style={{
                  width: "100%",
                  minHeight: "90px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  padding: "10px",
                  fontSize: "14px",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="btn btn-primary"
                  disabled={savingNotes}
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  {savingNotes ? "جاري الحفظ..." : "حفظ الملاحظات"}
                </button>
              </div>
            </div>

            {/* Quick WhatsApp Templates */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
                نماذج رسائل سريعة عبر WhatsApp:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => openWhatsApp(selectedRequest, "greeting")}
                  className="btn"
                  style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: "12px", padding: "6px 12px" }}
                >
                  👋 رسالة ترحيب واستلام
                </button>
                <button
                  onClick={() => openWhatsApp(selectedRequest, "update")}
                  className="btn"
                  style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", fontSize: "12px", padding: "6px 12px" }}
                >
                  🔄 إشعار بتحديث الحالة
                </button>
                <button
                  onClick={() => openWhatsApp(selectedRequest, "delivery")}
                  className="btn"
                  style={{ background: "#faf5ff", color: "#6b21a8", border: "1px solid #e9d5ff", fontSize: "12px", padding: "6px 12px" }}
                >
                  🚀 إشعار التسليم والجاهزية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Database Settings & Supabase Connection */}
      {activeModal === "db-settings" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Database size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: "19px" }}>إعدادات وربط قاعدة البيانات (Supabase)</h2>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    لربط منصة الحلول التقنية مع قاعدة بيانات مركزية وبث لحظي
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal("none")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            {dbTestResult && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  background: dbTestResult.success ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${dbTestResult.success ? "#bbf7d0" : "#fecaca"}`,
                  color: dbTestResult.success ? "#166534" : "#991b1b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {dbTestResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{dbTestResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveDbSettings}>
              <div className="field">
                <label>Supabase Project URL (رابط المشروع)</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="field">
                <label>Supabase Anon Key (مفتاح anon العمومي)</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={testingDb}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {testingDb ? <RefreshCw size={16} className="spin" /> : <Database size={16} />}
                  حفظ واختبار الاتصال
                </button>
              </div>
            </form>

            {/* Cloudflare Pages Hint */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px",
                fontSize: "12px",
                color: "#334155",
                marginBottom: "16px",
                lineHeight: "1.6",
              }}
            >
              ☁️ <b>لربطها على مستوى Cloudflare Pages الدائم:</b>
              <br />
              في لوحة تحكم Cloudflare &gt; Workers & Pages &gt; مشروعك &gt; Settings &gt; Environment Variables، أضف:
              <br />
              1. <code>NEXT_PUBLIC_SUPABASE_URL</code>
              <br />
              2. <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </div>

            {/* SQL Setup Instructions Box */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                  كود تهيئة الجداول والبث اللحظي في Supabase SQL Editor:
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlCode);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="btn btn-light"
                  style={{ fontSize: "12px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {copiedSql ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copiedSql ? "تم النسخ!" : "نسخ كود SQL"}
                </button>
              </div>

              <pre
                style={{
                  background: "#0f172a",
                  color: "#cbd5e1",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  direction: "ltr",
                  textAlign: "left",
                }}
              >
                {sqlCode}
              </pre>
              <small style={{ color: "#64748b", marginTop: "6px", display: "block" }}>
                💡 افتح لوحة تحكم Supabase ثم SQL Editor ثم الصق الكود واضغط Run لتفعيل الجداول والبث اللحظي الفوري.
              </small>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Change Admin Credentials */}
      {activeModal === "change-pass" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "19px" }}>تغيير كلمة مرور الإدارة</h2>
              <button
                onClick={() => setActiveModal("none")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            {passError && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#991b1b",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  marginBottom: "14px",
                }}
              >
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="field">
                <label>كلمة المرور الحالية</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>

              <div className="field">
                <label>كلمة المرور الجديدة (6 خانات على الأقل)</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="field">
                <label>تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  تحديث كلمة المرور
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="btn btn-light"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Add Manual Request */}
      {activeModal === "add-request" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "19px" }}>إضافة طلب جديد يدوياً</h2>
              <button
                onClick={() => setActiveModal("none")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAdd}>
              <div className="field">
                <label>اسم العميل</label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="مثال: أحمد عثمان"
                />
              </div>

              <div className="field">
                <label>رقم WhatsApp</label>
                <input
                  type="text"
                  required
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="+249xxxxxxxxx"
                />
              </div>

              <div className="field">
                <label>الخدمة</label>
                <select
                  value={manualService}
                  onChange={(e) => setManualService(e.target.value)}
                >
                  <option value="طلب مخصص">طلب مخصص</option>
                  <option value="التصميم الجرافيكي">التصميم الجرافيكي</option>
                  <option value="المواقع الإلكترونية">المواقع الإلكترونية</option>
                  <option value="تطبيقات الهاتف">تطبيقات الهاتف</option>
                  <option value="الملفات والمستندات">الملفات والمستندات</option>
                  <option value="Excel وقواعد البيانات">Excel وقواعد البيانات</option>
                  <option value="البرمجة والحلول التقنية">البرمجة والحلول التقنية</option>
                  <option value="الاستضافة والنشر">الاستضافة والنشر</option>
                  <option value="الخدمات الأكاديمية التقنية">الخدمات الأكاديمية</option>
                </select>
              </div>

              <div className="field">
                <label>التفاصيل والمتطلبات</label>
                <textarea
                  required
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  placeholder="اكتب مواصفات وتفاصيل طلب العميل..."
                  style={{ minHeight: "100px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingManual}
                  style={{ flex: 1 }}
                >
                  {submittingManual ? "جاري الإضافة..." : "حفظ الطلب"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("none")}
                  className="btn btn-light"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Delete Confirmation */}
      {activeModal === "delete-confirm" && selectedRequest && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", textAlign: "center" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>تأكيد حذف الطلب؟</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
              هل أنت متأكد من حذف طلب العميل <b>{selectedRequest.name}</b> (رقم: {selectedRequest.id}) نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleDeleteRequest}
                className="btn"
                style={{ flex: 1, background: "#dc2626", color: "#fff" }}
              >
                نعم، احذف الطلب
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("none")}
                className="btn btn-light"
                style={{ flex: 1 }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations and Responsiveness */}
      <style jsx global>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: #ffffff;
          border-radius: 20px;
          padding: 28px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          overflow-y: auto;
          animation: scaleUp 0.2s ease;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .pulse-anim {
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* Auto layout: On mobile phones, hide table and show cards */
        @media (max-width: 768px) {
          .table-view:not(.force-visible) {
            display: none !important;
          }
          .cards-view {
            display: block !important;
          }
          .filter-bar {
            grid-template-columns: 1fr !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }
        
        /* On desktops: by default show table, unless cards view selected */
        @media (min-width: 769px) {
          .cards-view:not(.force-visible) {
            display: none;
          }
          .force-hidden-desktop {
            display: none !important;
          }
        }
        .force-hidden {
          display: none !important;
        }
      `}</style>
    </>
  );
}
