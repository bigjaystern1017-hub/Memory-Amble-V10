import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Mock client for Guest/Offline mode
const createMockClient = (): SupabaseClient => {
  return new Proxy({} as SupabaseClient, {
    get(_, prop) {
      if (prop === "auth") {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithOAuth: async () => ({ error: new Error("Supabase not configured") }),
          signInWithPassword: async () => ({ error: new Error("Supabase not configured") }),
          signUp: async () => ({ error: new Error("Supabase not configured") }),
          signOut: async () => ({ error: null }),
        };
      }
      return undefined;
    },
  });
};

let supabaseInstance: SupabaseClient;

if (isConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn(
      "[Supabase] Failed to initialize Supabase client. Falling back to Guest/Offline mode.",
      error
    );
    supabaseInstance = createMockClient();
  }
} else {
  console.info("[Supabase] Environment variables not configured. Using Guest/Offline mode.");
  supabaseInstance = createMockClient();
}

export const supabase: SupabaseClient = supabaseInstance;

export { isConfigured as supabaseConfigured };
