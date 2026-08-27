import { createBrowserClient } from "@supabase/ssr";
let client: ReturnType<typeof createBrowserClient> | null = null;
export function getSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  client = createBrowserClient(url, key);
  return client;
}
