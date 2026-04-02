// ─── Supabase Admin Client (server-side only) ─────────────────────────────────
// Uses the service-role key — NEVER import this in client components.
// Only used in API routes (/app/api/**/route.ts).

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
