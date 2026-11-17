import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";

export const DEFAULT_SUPABASE_URL = "https://pfsoxbnsjejbljgbfbcs.supabase.co";

export function getSupabaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const val = import.meta.env["VITE_SUPABASE_URL"];
    if (typeof val === "string" && val.length > 0) return val;
  }
  return DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const val = import.meta.env["VITE_SUPABASE_ANON_KEY"];
    if (typeof val === "string") return val;
  }
  return "";
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  return Boolean(
    url &&
    anonKey &&
    anonKey.trim().length > 0 &&
    anonKey !== "your-supabase-anon-key-here" &&
    !anonKey.startsWith("your-supabase-"),
  );
}

declare global {
  interface Window {
    __sxlSupabaseClient?: SupabaseClient<Database>;
  }
}

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const isBrowser = typeof window !== "undefined";
  if (isBrowser && window.__sxlSupabaseClient) {
    return window.__sxlSupabaseClient;
  }

  if (!cachedClient) {
    const url = getSupabaseUrl();
    const anonKey = getSupabaseAnonKey();
    cachedClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: isBrowser,
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
      },
    });

    if (isBrowser) {
      window.__sxlSupabaseClient = cachedClient;
    }
  }

  return cachedClient;
}

export interface HealthCheckResult {
  configured: boolean;
  online: boolean;
  url: string;
  projectRef: string;
  message: string;
  status?: number;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const url = getSupabaseUrl();
  const configured = isSupabaseConfigured();
  const projectRef = url.replace("https://", "").split(".")[0] ?? "pfsoxbnsjejbljgbfbcs";

  if (!configured) {
    return {
      configured: false,
      online: false,
      url,
      projectRef,
      message: "Supabase anon key is missing or not configured. Falling back to local storage.",
      error: "MISSING_ANON_KEY",
    };
  }

  try {
    const client = getSupabaseClient();
    if (!client) {
      return {
        configured: false,
        online: false,
        url,
        projectRef,
        message: "Failed to initialize Supabase client instance.",
      };
    }

    const { error, status } = await client.from("programmes").select("id").limit(1);

    if (error) {
      return {
        configured: true,
        online: false,
        url,
        projectRef,
        status: status ?? undefined,
        message: `Supabase returned error: ${error.message}`,
        error: error.message,
      };
    }

    return {
      configured: true,
      online: true,
      url,
      projectRef,
      status: 200,
      message: "Supabase connection healthy. Remote database connected.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      online: false,
      url,
      projectRef,
      message: `Failed to connect to Supabase: ${msg}`,
      error: msg,
    };
  }
}
