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
    },
  });
}

export { supabase };
