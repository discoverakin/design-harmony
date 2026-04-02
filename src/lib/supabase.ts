import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Backend features will be unavailable."
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: ProxyHandler<any> = {
    get: (_target, _prop) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Proxy((() => Promise.resolve({ data: null, error: new Error("Supabase not configured") })) as any, handler);
    },
    apply: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
  };
  supabase = new Proxy({} as SupabaseClient, handler);
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "akin-auth",
      detectSessionInUrl: true,
      autoRefreshToken: true,
      flowType: "pkce",
      storage: {
        getItem: (key) => {
          const cookies = document.cookie.split(";");
          const cookie = cookies.find((c) => c.trim().startsWith(key + "="));
          return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
        },
        setItem: (key, value) => {
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax; Secure`;
        },
        removeItem: (key) => {
          document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
        },
      },
    },
  });
}

export { supabase };
