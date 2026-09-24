import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type ServiceRequest = {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  details: string;
  status: string;
  date: string;
  admin_notes?: string;
  final_file_url?: string;
  source?: "supabase" | "local";
};

const STORAGE_KEY_CONFIG = "smart_supabase_config";
const STORAGE_KEY_REQUESTS = "smart_requests";
const BROADCAST_CHANNEL_NAME = "smart_requests_channel";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  if (typeof window === "undefined") {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    };
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return { url: "", anonKey: "" };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY_CONFIG,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
  }
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
        persistSession: false,
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
  } catch (err) {
    console.error("Error creating Supabase client:", err);
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
      message: "لم يتم إدخال بيانات الربط (Project URL أو Anon Key)",
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
          message:
            "تم الاتصال بـ Supabase، ولكن جدول service_requests غير موجود. يرجى تنفيذ كود SQL في SQL Editor.",
        };
      }
      return {
        success: false,
        message: `خطأ في الاتصال: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "تم الاتصال بقاعدة بيانات Supabase بنجاح تام! 🟢",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: `فشل الاتصال: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// Broadcast event across tabs/windows on the same browser
function broadcastEvent(action: "new" | "update" | "delete", request?: ServiceRequest) {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ action, request, timestamp: Date.now() });
      setTimeout(() => {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }, 500);
    } catch {
      // ignore
    }
  }
}

// Audio notification chime using Web Audio API
export function playNotificationChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // Audio autoplay restrictions or not supported
  }
}

// Get local requests safely
export function getLocalRequests(): ServiceRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRequests(requests: ServiceRequest[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  }
}

// Fetch all requests: queries Supabase and updates local cache
export async function getAllRequests(): Promise<{
  requests: ServiceRequest[];
  isRemote: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      requests: getLocalRequests(),
      isRemote: false,
    };
  }

  try {
    const { data, error } = await client
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch failed, falling back to local:", error.message);
      return {
        requests: getLocalRequests(),
        isRemote: false,
        error: error.message,
      };
    }

    const remoteRequests: ServiceRequest[] = (data || []).map((row) => ({
      id: String(row.id),
      name: row.customer_name || "بدون اسم",
      whatsapp: row.whatsapp || "",
      service: row.service || "طلب مخصص",
      details: row.details || "",
      status: row.status || "جديد",
      date: row.created_at || new Date().toISOString(),
      admin_notes: row.admin_notes || "",
      final_file_url: row.final_file_url || "",
      source: "supabase",
    }));

    saveLocalRequests(remoteRequests);

    return {
      requests: remoteRequests,
      isRemote: true,
    };
  } catch (err: unknown) {
    console.error("Fetch requests error:", err);
    return {
      requests: getLocalRequests(),
      isRemote: false,
      error: err instanceof Error ? err.message : "خطأ غير معروف",
    };
  }
}

// Create new service request
export async function createServiceRequest(params: {
  id?: string;
  name: string;
  whatsapp: string;
  service: string;
  details: string;
}): Promise<{ success: boolean; request: ServiceRequest; error?: string }> {
  const client = getSupabaseClient();
  const requestId = params.id || `REQ-${Date.now().toString().slice(-8)}`;
  const now = new Date().toISOString();

  const newRequest: ServiceRequest = {
    id: requestId,
    name: params.name.trim(),
    whatsapp: params.whatsapp.trim(),
    service: params.service,
    details: params.details.trim(),
    status: "جديد",
    date: now,
    admin_notes: "",
  };

  // Always save locally first for resilience
  const currentLocal = getLocalRequests();
  saveLocalRequests([newRequest, ...currentLocal]);

  // Broadcast instantly to any open admin tabs on same device/browser
  broadcastEvent("new", newRequest);

  if (client) {
    try {
      const { data, error } = await client
        .from("service_requests")
        .insert([
          {
            customer_name: newRequest.name,
            whatsapp: newRequest.whatsapp,
            service: newRequest.service,
            details: newRequest.details,
            status: newRequest.status,
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn("Supabase insert error:", error);
        return {
          success: true,
          request: newRequest,
          error: `حُفظ محلياً فقط (${error.message})`,
        };
      }

      if (data?.id) {
        newRequest.id = String(data.id);
        newRequest.source = "supabase";
        const updated = [newRequest, ...currentLocal];
        saveLocalRequests(updated);
        broadcastEvent("new", newRequest);
      }
    } catch (err: unknown) {
      console.error("Supabase insert failed:", err);
    }
  }

  return { success: true, request: newRequest };
}

// Update request status & admin notes
export async function updateRequestStatusAndNotes(
  id: string,
  status: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  const currentLocal = getLocalRequests();
  let updatedItem: ServiceRequest | undefined;
  const updatedLocal = currentLocal.map((r) => {
    if (r.id === id) {
      updatedItem = {
        ...r,
        status,
        admin_notes: adminNotes !== undefined ? adminNotes : r.admin_notes,
      };
      return updatedItem;
    }
    return r;
  });
  saveLocalRequests(updatedLocal);

  if (updatedItem) {
    broadcastEvent("update", updatedItem);
  }

  if (client) {
    try {
      const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (adminNotes !== undefined) {
        updatePayload.admin_notes = adminNotes;
      }

      const { error } = await client
        .from("service_requests")
        .update(updatePayload)
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "خطأ في التحديث",
      };
    }
  }

  return { success: true };
}

// Delete request
export async function deleteServiceRequest(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  const currentLocal = getLocalRequests();
  const updatedLocal = currentLocal.filter((r) => r.id !== id);
  saveLocalRequests(updatedLocal);
  broadcastEvent("delete");

  if (client) {
    try {
      const { error } = await client
        .from("service_requests")
        .delete()
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "خطأ أثناء الحذف",
      };
    }
  }

  return { success: true };
}

// Subscribe to real-time events (Supabase WebSockets + BroadcastChannel + Storage Event)
export function subscribeToRealtimeRequests(callbacks: {
  onNew: (req: ServiceRequest) => void;
  onUpdate: (req: ServiceRequest) => void;
  onDelete: () => void;
}): () => void {
  const client = getSupabaseClient();
  let supabaseChannel: ReturnType<SupabaseClient["channel"]> | null = null;

  // 1. Supabase Realtime WebSocket Listener (Syncs across completely different devices & networks)
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
            const row = payload.new as Record<string, unknown>;
            const newReq: ServiceRequest = {
              id: String(row.id),
              name: String(row.customer_name || "عميل جديد"),
              whatsapp: String(row.whatsapp || ""),
              service: String(row.service || "طلب مخصص"),
              details: String(row.details || ""),
              status: String(row.status || "جديد"),
              date: String(row.created_at || new Date().toISOString()),
              admin_notes: String(row.admin_notes || ""),
              final_file_url: String(row.final_file_url || ""),
              source: "supabase",
            };
            callbacks.onNew(newReq);
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
            const row = payload.new as Record<string, unknown>;
            const updatedReq: ServiceRequest = {
              id: String(row.id),
              name: String(row.customer_name || ""),
              whatsapp: String(row.whatsapp || ""),
              service: String(row.service || ""),
              details: String(row.details || ""),
              status: String(row.status || ""),
              date: String(row.created_at || new Date().toISOString()),
              admin_notes: String(row.admin_notes || ""),
              final_file_url: String(row.final_file_url || ""),
              source: "supabase",
            };
            callbacks.onUpdate(updatedReq);
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
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Supabase Realtime connected successfully");
          }
        });
    } catch (err) {
      console.warn("Could not set up Supabase realtime channel:", err);
    }
  }

  // 2. BroadcastChannel Listener (Syncs across tabs immediately on same browser)
  let bc: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = (ev) => {
        const data = ev.data;
        if (!data) return;
        if (data.action === "new" && data.request) {
          callbacks.onNew(data.request);
        } else if (data.action === "update" && data.request) {
          callbacks.onUpdate(data.request);
        } else if (data.action === "delete") {
          callbacks.onDelete();
        }
      };
    } catch {
      // ignore
    }
  }

  // 3. Storage Event Listener (Additional cross-tab safety)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_REQUESTS) {
      callbacks.onDelete(); // triggers data reload
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  // Cleanup function
  return () => {
    if (supabaseChannel && client) {
      client.removeChannel(supabaseChannel);
    }
    if (bc) {
      try {
        bc.close();
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}
