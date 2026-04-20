/**
 * /api/admin/push-ghl
 * ────────────────────
 * Creates (or updates) a GHL contact + opportunity for a claimed studio owner.
 * Called from the admin dashboard when you click "Push to GHL" on a claim.
 *
 * POST /api/admin/push-ghl
 * Authorization: Bearer <ADMIN_SECRET>
 * Body: { claim_id, owner_name, owner_email, owner_phone,
 *         studio_title, studio_slug, tier }
 *
 * GHL flow:
 *  1. Upsert contact by email (create or find existing)
 *  2. Fetch the first pipeline from this GHL location
 *  3. Create an opportunity in the correct stage based on tier:
 *     - "claimed"  → stage named "Claimed — Free"  (first stage)
 *     - "paid"     → stage named "Featured"        (last stage)
 *  4. Tag the contact: "bdd-claimed" or "bdd-featured"
 *  5. Return the GHL contact ID and opportunity ID
 */

import { NextRequest, NextResponse } from "next/server";

const GHL_BASE    = "https://services.leadconnectorhq.com";
const GHL_TOKEN   = process.env.GHL_API_TOKEN ?? "pit-2544feeb-2cfb-411e-a7cd-0612e99f3461";
const LOCATION_ID = "gKAwJUdSQ6QMlAc0QXWb";
const GHL_VERSION = "2021-07-28";

const GHL_HEADERS = {
  "Authorization": `Bearer ${GHL_TOKEN}`,
  "Version":       GHL_VERSION,
  "Content-Type":  "application/json",
};

// ── Helper: GHL fetch wrapper ─────────────────────────────────────────────────

async function ghl<T>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const res = await fetch(`${GHL_BASE}${path}`, {
    method,
    headers: GHL_HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth check ────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    claim_id,
    owner_name,
    owner_email,
    owner_phone,
    studio_title,
    studio_slug,
    tier,
  } = await req.json();

  if (!owner_email || !studio_slug) {
    return NextResponse.json({ error: "Missing owner_email or studio_slug" }, { status: 400 });
  }

  const listingUrl = `https://www.ballroomdancedirectory.com/studios/${studio_slug}`;
  const [firstName, ...rest] = (owner_name ?? "Studio Owner").split(" ");
  const lastName = rest.join(" ") || "Owner";
  const tag = tier === "paid" ? "bdd-featured" : "bdd-claimed";

  try {
    // ── 1. Upsert GHL contact ─────────────────────────────────────────────────
    let contactId: string;

    // Search for existing contact by email
    const searchRes = await ghl<any>(
      "GET",
      `/contacts/?locationId=${LOCATION_ID}&query=${encodeURIComponent(owner_email)}`
    );

    const existing = searchRes?.contacts?.find(
      (c: any) => c.email?.toLowerCase() === owner_email.toLowerCase()
    );

    if (existing) {
      contactId = existing.id;
      // Update contact with latest info + tag
      await ghl("PUT", `/contacts/${contactId}`, {
        firstName,
        lastName,
        phone: owner_phone ?? "",
        tags: [tag, "ballroom-dance-directory"],
        customFields: [
          { key: "studio_name",  field_value: studio_title },
          { key: "studio_slug",  field_value: studio_slug  },
          { key: "listing_url",  field_value: listingUrl   },
          { key: "claim_id",     field_value: claim_id     },
          { key: "studio_tier",  field_value: tier         },
        ],
      });
    } else {
      // Create new contact
      const createRes = await ghl<any>("POST", `/contacts/`, {
        locationId: LOCATION_ID,
        firstName,
        lastName,
        email: owner_email,
        phone: owner_phone ?? "",
        source: "Ballroom Dance Directory",
        tags: [tag, "ballroom-dance-directory"],
        customFields: [
          { key: "studio_name",  field_value: studio_title },
          { key: "studio_slug",  field_value: studio_slug  },
          { key: "listing_url",  field_value: listingUrl   },
          { key: "claim_id",     field_value: claim_id     },
          { key: "studio_tier",  field_value: tier         },
        ],
      });
      contactId = createRes?.contact?.id;
    }

    if (!contactId) {
      throw new Error("Failed to get GHL contact ID");
    }

    // ── 2. Get pipeline ───────────────────────────────────────────────────────
    const pipelineRes = await ghl<any>(
      "GET",
      `/opportunities/pipelines?locationId=${LOCATION_ID}`
    );

    const pipelines: any[] = pipelineRes?.pipelines ?? [];

    // Look for our BDD pipeline first, otherwise use the first one
    const pipeline =
      pipelines.find((p: any) =>
        p.name?.toLowerCase().includes("bdd") ||
        p.name?.toLowerCase().includes("ballroom") ||
        p.name?.toLowerCase().includes("studio")
      ) ?? pipelines[0];

    if (!pipeline) {
      throw new Error("No GHL pipeline found. Please create a pipeline in GHL first.");
    }

    const stages: any[] = pipeline.stages ?? [];

    // Pick stage based on tier:
    //   - "paid"    → last stage (Featured / Closed Won)
    //   - "claimed" → first stage (Claimed — Free / New Lead)
    const targetStage = tier === "paid"
      ? (stages.find((s: any) => s.name?.toLowerCase().includes("feature")) ?? stages[stages.length - 1])
      : (stages.find((s: any) =>
          s.name?.toLowerCase().includes("claimed") ||
          s.name?.toLowerCase().includes("new")
        ) ?? stages[0]);

    // ── 3. Create opportunity ─────────────────────────────────────────────────
    const oppRes = await ghl<any>("POST", `/opportunities/`, {
      pipelineId:      pipeline.id,
      pipelineStageId: targetStage?.id,
      locationId:      LOCATION_ID,
      contactId,
      name:  `${studio_title} — ${tier === "paid" ? "Featured" : "Claimed (Free)"}`,
      status: tier === "paid" ? "won" : "open",
      monetaryValue: tier === "paid" ? 49 : 0,
      customFields: [
        { key: "listing_url", field_value: listingUrl },
        { key: "claim_id",    field_value: claim_id   },
      ],
    });

    const opportunityId = oppRes?.opportunity?.id;

    return NextResponse.json({
      success:       true,
      contactId,
      opportunityId,
      pipeline:      pipeline.name,
      stage:         targetStage?.name,
    });

  } catch (err: any) {
    console.error("GHL push error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
