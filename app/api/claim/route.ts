// ─── POST /api/claim ──────────────────────────────────────────────────────────
// Called by /claim/callback after Supabase magic link is verified.
// 1. Validates the request body
// 2. Checks for duplicate claims
// 3. Inserts claim into Supabase (status: "verified")
// 4. Patches the WP studio post with studio_tier = "claimed"
// 5. Sends admin notification email + claimant confirmation email via Resend
// 6. Returns { success: true, claim_id }

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const WP_API_URL    = process.env.WP_API_URL || "http://5.78.144.42/wp-json";
const WP_APP_USER   = process.env.WP_APP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";
const ADMIN_EMAIL   = "bpalmer@abilenewebsitedesign.com";
const FROM_EMAIL    = "leads@ballroomdancedirectory.com";

// GHL Workflow #1 — fires when a studio claim is submitted
const GHL_CLAIM_WEBHOOK = "https://services.leadconnectorhq.com/hooks/gKAwJUdSQ6QMlAc0QXWb/webhook-trigger/77d77491-b7cf-463a-b228-c8876aaebb83";

const resend = new Resend(process.env.RESEND_API_KEY);

// Base64 encode credentials for WP Application Password auth
function wpAuthHeader(): string {
  return "Basic " + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studio_id,
      studio_slug,
      studio_title,
      owner_name,
      owner_email,
      owner_phone,
      user_id,
    } = body;

    // ── Validate required fields ───────────────────────────────────────────
    if (!studio_id || !studio_slug || !owner_name || !owner_email || !user_id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // ── Check for duplicate claim ─────────────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("claims")
      .select("id, status")
      .eq("studio_slug", studio_slug)
      .in("status", ["pending", "verified", "approved"])
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, code: "already_claimed", message: "This listing has already been claimed." },
        { status: 409 }
      );
    }

    // ── Insert claim into Supabase ─────────────────────────────────────────
    const { data: claim, error: insertError } = await supabaseAdmin
      .from("claims")
      .insert({
        studio_id:    Number(studio_id),
        studio_slug,
        studio_title,
        owner_name,
        owner_email,
        owner_phone:  owner_phone || "",
        user_id,
        status:       "verified", // email was verified via magic link
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to record claim. Please try again." },
        { status: 500 }
      );
    }

    // ── Fire GHL Workflow #1 (non-fatal) ──────────────────────────────────────
    // Places the contact into the Studio Owner Pipeline → "Claimed" stage.
    const studioUrl = `${SITE_URL}/studios/${studio_slug}`;
    try {
      const nameParts  = owner_name.trim().split(/\s+/);
      const first_name = nameParts[0] || "";
      const last_name  = nameParts.slice(1).join(" ") || "";

      await fetch(GHL_CLAIM_WEBHOOK, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:        owner_email,
          first_name,
          last_name,
          studio_slug,
          studio_name:  studio_title,
          claim_id:     claim.id,
          listing_url:  studioUrl,
          tier:         "claimed",
        }),
      });
    } catch (ghlErr) {
      console.warn("[claim] GHL webhook error:", ghlErr);
    }

    // ── Update WP studio_tier via REST API ─────────────────────────────────
    // Only attempt if WP Application Password is configured
    if (WP_APP_PASSWORD) {
      try {
        const wpRes = await fetch(`${WP_API_URL}/wp/v2/dance_studio/${studio_id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": wpAuthHeader(),
          },
          body: JSON.stringify({
            acf: { studio_tier: "claimed" },
          }),
        });
        if (!wpRes.ok) {
          const wpBody = await wpRes.text();
          console.warn(`WP tier update failed (${wpRes.status}): ${wpBody}`);
          // Non-fatal — claim is recorded in Supabase; WP can be updated manually
        }
      } catch (wpErr) {
        console.warn("WP tier update threw:", wpErr);
        // Non-fatal
      }

      // Bust the ISR cache for this studio's detail page so the amber
      // "claim this listing" bar disappears immediately on the next request.
      try { revalidatePath(`/studios/${studio_slug}`); } catch { /* non-fatal */ }
    }

    // ── Send emails via Resend (non-fatal on failure) ──────────────────────
    try {
      // studioUrl already defined above (used for GHL webhook)

      // 1. Admin notification
      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      ADMIN_EMAIL,
        subject: `New studio claim: ${studio_title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#0c1428;margin-bottom:4px">New Claim Received</h2>
            <p style="color:#6b7280;margin-top:0">A studio owner has verified their email and submitted a claim.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:8px 0;color:#374151;font-weight:600;width:140px">Studio</td>
                  <td style="padding:8px 0;color:#111827">${studio_title}</td></tr>
              <tr><td style="padding:8px 0;color:#374151;font-weight:600">Owner Name</td>
                  <td style="padding:8px 0;color:#111827">${owner_name}</td></tr>
              <tr><td style="padding:8px 0;color:#374151;font-weight:600">Owner Email</td>
                  <td style="padding:8px 0;color:#111827">${owner_email}</td></tr>
              ${owner_phone ? `<tr><td style="padding:8px 0;color:#374151;font-weight:600">Phone</td>
                  <td style="padding:8px 0;color:#111827">${owner_phone}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#374151;font-weight:600">Studio Page</td>
                  <td style="padding:8px 0"><a href="${studioUrl}" style="color:#b8922a">${studioUrl}</a></td></tr>
            </table>
            <p style="color:#6b7280;font-size:13px">
              The claim status is currently <strong>verified</strong> (email confirmed).
              Review in your Supabase dashboard and approve or reject as appropriate.
            </p>
          </div>
        `,
      });

      // 2. Claimant confirmation — full branded Email #1 template
      //    (GHL nurture sequence starts at Email #2; this email is owned by Resend)
      const firstName = owner_name.trim().split(/\s+/)[0] || owner_name;
      await resend.emails.send({
        from:    FROM_EMAIL,
        to:      owner_email,
        subject: `Your listing claim for ${studio_title} is confirmed`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
<tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
  <tr>
    <td style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
      <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Ballroom Dance Directory</p>
      <h1 style="color:#fff;font-size:26px;font-weight:300;margin:0;line-height:1.3;">Your listing claim is confirmed.</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:10px 0 0;">Here's what happens next.</p>
    </td>
  </tr>
  <tr>
    <td style="background:#fff;padding:40px 40px 32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">Our team has received your claim for <strong>${studio_title}</strong> on Ballroom Dance Directory. Your email is verified — we're reviewing your ownership details now.</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">Expect an approval email within 1 business day. Once approved, you'll have access to your listing dashboard and everything that comes with it.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border:1.5px solid #e8c560;border-radius:12px;margin-bottom:28px;">
        <tr><td style="padding:24px 28px;">
          <p style="color:#374151;font-size:14px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px;">What's happening now</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="28" valign="top" style="padding-right:12px;padding-bottom:14px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#b8922a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">1</div>
              </td>
              <td style="padding-bottom:14px;">
                <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Claim received &amp; email verified</p>
                <p style="color:#6b7280;font-size:13px;margin:0;">Done — you're here now.</p>
              </td>
            </tr>
            <tr>
              <td width="28" valign="top" style="padding-right:12px;padding-bottom:14px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:12px;font-weight:700;text-align:center;line-height:24px;">2</div>
              </td>
              <td style="padding-bottom:14px;">
                <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Ownership review</p>
                <p style="color:#6b7280;font-size:13px;margin:0;">Our team verifies your claim (within 1 business day).</p>
              </td>
            </tr>
            <tr>
              <td width="28" valign="top" style="padding-right:12px;">
                <div style="width:24px;height:24px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:12px;font-weight:700;text-align:center;line-height:24px;">3</div>
              </td>
              <td>
                <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Listing approved + dashboard access</p>
                <p style="color:#6b7280;font-size:13px;margin:0;">Manage your profile, respond to inquiries, and upgrade anytime.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="text-align:center;padding-bottom:28px;">
          <a href="${studioUrl}" style="display:inline-block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;letter-spacing:0.5px;">View Your Listing &#8594;</a>
        </td></tr>
      </table>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">Questions? Just reply to this email — it comes straight to us.</p>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">Looking forward to helping your studio stand out,</p>
      <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Ballroom Dance Directory Team</p>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">Ballroom Dance Directory &middot; <a href="${SITE_URL}" style="color:#9ca3af;">www.ballroomdancedirectory.com</a><br>You're receiving this because you claimed a listing on our platform.</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
      });
    } catch (emailErr) {
      // Non-fatal — claim is already recorded; log but don't fail the request
      console.warn("Resend email error:", emailErr);
    }

    return NextResponse.json({ success: true, claim_id: claim.id });

  } catch (err) {
    console.error("POST /api/claim error:", err);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
