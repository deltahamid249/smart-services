import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type ServiceRequest = {
  id: string;
  customer_id?: string | null;
  name: string;
  whatsapp: string;
  service: string;
  details: string;
  status: string;
  date: string;
  admin_notes?: string;
  final_file_url?: string;
  tracking_token?: string;
  source?: "supabase" | "local";
};

const STORAGE_KEY_REQUESTS = "smart_requests";
const BROADCAST_CHANNEL_NAME = "smart_requests_channel";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    anonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
  };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = "";
let lastUsedKey = "";

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();

  if (!config.url || !config.anonKey) {
    return null;
  }

  if (
    cachedClient &&
    lastUsedUrl === config.url &&
    lastUsedKey === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;

    return cachedClient;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      message: "لم يتم ضبط بيانات Supabase في ملف البيئة.",
    };
  }

  try {
    const { error } = await client
      .from("service_requests")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === "42P01") {
        return {
          success: false,
          message: "جدول service_requests غير موجود.",
        };
      }

      return {
        success: false,
        message: `خطأ في الاتصال: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "تم الاتصال بقاعدة بيانات Supabase بنجاح.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "فشل الاتصال بـ Supabase.",
    };
  }
}

function broadcastEvent(
  action: "new" | "update" | "delete",
  request?: ServiceRequest
) {
  if (
    typeof window !== "undefined" &&
    "BroadcastChannel" in window
  ) {
    try {
      const channel = new BroadcastChannel(
        BROADCAST_CHANNEL_NAME
      );

      channel.postMessage({
        action,
        request,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        try {
          channel.close();
        } catch {
          // ignore
        }
      }, 500);
    } catch {
      // ignore
    }
  }
}

export function playNotificationChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as unknown as {
          webkitAudioContext: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      587.33,
      context.currentTime
    );
    oscillator.frequency.setValueAtTime(
      880,
      context.currentTime + 0.12
    );

    gain.gain.setValueAtTime(
      0.2,
      context.currentTime
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.45
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
  } catch {
    // ignore
  }
}

export function getLocalRequests(): ServiceRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(
      STORAGE_KEY_REQUESTS
    );

    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRequests(
  requests: ServiceRequest[]
): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY_REQUESTS,
      JSON.stringify(requests)
    );
  }
}

/**
 * المدير فقط يستخدم هذه الدالة لجلب جميع الطلبات.
 * حماية القراءة الفعلية موجودة في RLS داخل Supabase.
 */
export async function getAllRequests(): Promise<{
  requests: ServiceRequest[];
  isRemote: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      requests: [],
      isRemote: false,
      error: "تعذر الاتصال بـ Supabase.",
    };
  }

  try {
    const { data, error } = await client
      .from("service_requests")
      .select(
        "id, customer_id, customer_name, whatsapp, service, details, status, admin_notes, final_file_url, tracking_token, created_at, updated_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Supabase fetch failed:",
        error.message
      );

      return {
        requests: [],
        isRemote: false,
        error: error.message,
      };
    }

    const requests: ServiceRequest[] =
      (data || []).map((row) => ({
        id: String(row.id),
        customer_id: row.customer_id
          ? String(row.customer_id)
          : null,
        name: row.customer_name || "بدون اسم",
        whatsapp: row.whatsapp || "",
        service: row.service || "طلب مخصص",
        details: row.details || "",
        status: row.status || "جديد",
        date:
          row.created_at ||
          new Date().toISOString(),
        admin_notes: row.admin_notes || "",
        final_file_url:
          row.final_file_url || "",
        tracking_token:
          row.tracking_token || "",
        source: "supabase",
      }));

    return {
      requests,
      isRemote: true,
    };
  } catch (error: unknown) {
    return {
      requests: [],
      isRemote: false,
      error:
        error instanceof Error
          ? error.message
          : "خطأ غير معروف.",
    };
  }
}

/**
 * جلب طلب واحد بواسطة رمز المتابعة السري.
 *
 * هذه الدالة تستخدم RPC في Supabase،
 * ولا تسمح للعميل بقراءة جدول الطلبات مباشرة.
 */
export async function getRequestByTrackingToken(
  trackingToken: string
): Promise<{
  request: ServiceRequest | null;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      request: null,
      error: "تعذر الاتصال بـ Supabase.",
    };
  }

  const token = trackingToken.trim();

  if (!token) {
    return {
      request: null,
      error: "رمز المتابعة غير موجود.",
    };
  }

  try {
    const { data, error } =
      await client.rpc(
        "get_request_by_tracking_token",
        {
          p_tracking_token: token,
        }
      );

    if (error) {
      console.error(
        "Tracking request failed:",
        error.message
      );

      return {
        request: null,
        error: error.message,
      };
    }

    const row = Array.isArray(data)
      ? data[0]
      : data;

    if (!row) {
      return {
        request: null,
        error:
          "لم يتم العثور على طلب بهذا الرمز.",
      };
    }

    const request: ServiceRequest = {
      id: String(row.id),
      customer_id: row.customer_id
        ? String(row.customer_id)
        : null,
      name: row.customer_name || "",
      whatsapp: row.whatsapp || "",
      service: row.service || "",
      details: row.details || "",
      status: row.status || "جديد",
      date:
        row.created_at ||
        new Date().toISOString(),
      admin_notes: row.admin_notes || "",
      final_file_url:
        row.final_file_url || "",
      source: "supabase",
    };

    return {
      request,
    };
  } catch (error: unknown) {
    return {
      request: null,
      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء متابعة الطلب.",
    };
  }
}

/**
 * إنشاء رمز متابعة عشوائي قوي.
 */
function generateTrackingToken(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/**
 * إنشاء طلب جديد.
 */
export async function createServiceRequest(params: {
  id?: string;
  name: string;
  whatsapp: string;
  service: string;
  details: string;
}): Promise<{
  success: boolean;
  request: ServiceRequest;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error(
      "تعذر الاتصال بـ Supabase. تأكد من إعداد متغيرات البيئة."
    );
  }

  const trackingToken =
    generateTrackingToken();

  const { data, error } = await client
    .from("service_requests")
    .insert({
      customer_name: params.name.trim(),
      whatsapp: params.whatsapp.trim(),
      service: params.service.trim(),
      details: params.details.trim(),
      status: "جديد",
      admin_notes: "",
      tracking_token: trackingToken,
    })
    .select(
      "id, customer_id, customer_name, whatsapp, service, details, status, admin_notes, final_file_url, tracking_token, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ||
        "تعذر حفظ الطلب."
    );
  }

  const request: ServiceRequest = {
    id: String(data.id),
    customer_id: data.customer_id
      ? String(data.customer_id)
      : null,
    name: data.customer_name,
    whatsapp: data.whatsapp,
    service: data.service,
    details: data.details,
    status: data.status,
    date:
      data.created_at ||
      new Date().toISOString(),
    admin_notes:
      data.admin_notes || "",
    final_file_url:
      data.final_file_url || "",
    tracking_token:
      data.tracking_token ||
      trackingToken,
    source: "supabase",
  };

  broadcastEvent("new", request);

  return {
    success: true,
    request,
  };
}

export async function updateRequestStatusAndNotes(
  id: string,
  status: string,
  adminNotes?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      error: "تعذر الاتصال بـ Supabase.",
    };
  }

  try {
    const updatePayload: Record<
      string,
      unknown
    > = {
      status,
      updated_at:
        new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
      updatePayload.admin_notes =
        adminNotes;
    }

    const { error } = await client
      .from("service_requests")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "خطأ في تحديث الطلب.",
    };
  }
}

export async function deleteServiceRequest(
  id: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      error: "تعذر الاتصال بـ Supabase.",
    };
  }

  try {
    const { error } = await client
      .from("service_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    broadcastEvent("delete");

    return {
      success: true,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "خطأ أثناء حذف الطلب.",
    };
  }
}

export function subscribeToRealtimeRequests(callbacks: {
  onNew: (request: ServiceRequest) => void;
  onUpdate: (request: ServiceRequest) => void;
  onDelete: () => void;
}): () => void {
  const client = getSupabaseClient();

  let supabaseChannel:
    | ReturnType<SupabaseClient["channel"]>
    | null = null;

  if (client) {
    try {
      supabaseChannel = client
        .channel("service_requests_live")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "service_requests",
          },
          (payload) => {
            const row =
              payload.new as Record<
                string,
                unknown
              >;

            callbacks.onNew({
              id: String(row.id),
              customer_id:
                row.customer_id
                  ? String(row.customer_id)
                  : null,
              name: String(
                row.customer_name ||
                  "عميل جديد"
              ),
              whatsapp: String(
                row.whatsapp || ""
              ),
              service: String(
                row.service ||
                  "طلب مخصص"
              ),
              details: String(
                row.details || ""
              ),
              status: String(
                row.status || "جديد"
              ),
              date: String(
                row.created_at ||
                  new Date().toISOString()
              ),
              admin_notes: String(
                row.admin_notes || ""
              ),
              final_file_url: String(
                row.final_file_url || ""
              ),
              tracking_token: String(
                row.tracking_token || ""
              ),
              source: "supabase",
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "service_requests",
          },
          (payload) => {
            const row =
              payload.new as Record<
                string,
                unknown
              >;

            callbacks.onUpdate({
              id: String(row.id),
              customer_id:
                row.customer_id
                  ? String(row.customer_id)
                  : null,
              name: String(
                row.customer_name || ""
              ),
              whatsapp: String(
                row.whatsapp || ""
              ),
              service: String(
                row.service || ""
              ),
              details: String(
                row.details || ""
              ),
              status: String(
                row.status || ""
              ),
              date: String(
                row.created_at ||
                  new Date().toISOString()
              ),
              admin_notes: String(
                row.admin_notes || ""
              ),
              final_file_url: String(
                row.final_file_url || ""
              ),
              tracking_token: String(
                row.tracking_token || ""
              ),
              source: "supabase",
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "service_requests",
          },
          () => {
            callbacks.onDelete();
          }
        )
        .subscribe();
    } catch (error) {
      console.warn(
        "Could not set up Supabase realtime:",
        error
      );
    }
  }

  let broadcastChannel:
    | BroadcastChannel
    | null = null;

  if (
    typeof window !== "undefined" &&
    "BroadcastChannel" in window
  ) {
    try {
      broadcastChannel =
        new BroadcastChannel(
          BROADCAST_CHANNEL_NAME
        );

      broadcastChannel.onmessage = (
        event
      ) => {
        const data = event.data;

        if (!data) return;

        if (
          data.action === "new" &&
          data.request
        ) {
          callbacks.onNew(data.request);
        } else if (
          data.action === "update" &&
          data.request
        ) {
          callbacks.onUpdate(
            data.request
          );
        } else if (
          data.action === "delete"
        ) {
          callbacks.onDelete();
        }
      };
    } catch {
      // ignore
    }
  }

  return () => {
    if (supabaseChannel && client) {
      client.removeChannel(
        supabaseChannel
      );
    }

    if (broadcastChannel) {
      try {
        broadcastChannel.close();
      } catch {
        // ignore
      }
    }
  };
}

export function saveSupabaseConfig(
  url: string,
  key: string
): void {
  void url;
  void key;
}
