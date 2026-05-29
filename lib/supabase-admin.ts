// ─── Supabase Admin Client (server-side only) ─────────────────────────────────
// Uses the service-role key — NEVER import this in client components.
// Only used in API routes (/app/api/**/route.ts).

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Graceful degradation: if Supabase isn't configured yet, create a dummy
// client that won't crash the build. API routes using it will fail at
// runtime with a clear error, but static pages won't crash at build time.
export const supabaseAdmin = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : (null as any);
