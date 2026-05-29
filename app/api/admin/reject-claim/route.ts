/**
 * POST /api/admin/reject-claim
 * ─────────────────────────────
 * Rejects a pending studio claim:
 *   1. Validates admin token
 *   2. Updates Supabase claim status → "rejected"
 *   3. Sends a polite rejection email to the claimant via Resend
 *
 * Body: { claim_id, reason? }
 * Authorization: Bearer <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "leads@greenpestdirectory.com";
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || "https://www.greenpestdirectory.com";

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { claim_id, reason } = await req.json();
  if (!claim_id) {
    return NextResponse.json({ error: "Missing claim_id" }, { status: 400 });
  }

  // ── 1. Fetch the claim ────────────────────────────────────────────────────
  const { data: claim, error: fetchErr } = await supabaseAdmin
    .from("claims")
    .select("id, studio_title, studio_slug, owner_name, owner_email, status")
    .eq("id", claim_id)
    .single();

  if (fetchErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (claim.status !== "verified") {
    return NextResponse.json({ error: `Claim is already ${claim.status}` }, { status: 409 });
  }

  // ── 2. Update status → rejected ───────────────────────────────────────────
  const { error: updateErr } = await supabaseAdmin
    .from("claims")
    .update({ status: "rejected" })
    .eq("id", claim_id);

  if (updateErr) {
    console.error("Supabase reject error:", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // ── 3. Send rejection email ────────────────────────────────────────────────
  const listingUrl  = `${SITE_URL}/studios/${claim.studio_slug}`;
  const contactUrl  = `${SITE_URL}/contact`;
  const firstName   = claim.owner_name.split(" ")[0];

  const reasonHtml = reason
    ? `<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
         Reason: <em>${reason}</em>
       </p>`
    : "";

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      claim.owner_email,
      subject: `Regarding your listing claim for ${claim.studio_title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
        <tr><td>
        <table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#0c1428,#1a2d5a);border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
              <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Green Pest Control Directory</p>
              <h1 style="color:#fff;font-size:24px;font-weight:300;margin:0;line-height:1.3;">Update on your listing claim</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:40px 40px 32px;">
              <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Thank you for submitting a claim for <strong>${claim.studio_title}</strong> on
                the Green Pest Control Directory. After reviewing your submission, we were unable to
                verify ownership at this time.
              </p>
              ${reasonHtml}
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Your free listing for ${claim.studio_title} remains active and visible to dancers
                searching the directory. If you believe this decision was made in error, or if
                you can provide additional information to verify your ownership, please reach out
                to us directly — we're happy to take another look.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="${contactUrl}" style="display:block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;">Contact Us →</a>
                  </td>
                  <td style="padding-left:8px;">
                    <a href="${listingUrl}" style="display:block;background:#f9fafb;color:#374151;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;border:1.5px solid #e5e7eb;">View Your Listing →</a>
                  </td>
                </tr>
              </table>
              <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Green Pest Control Directory Team</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
                Green Pest Control Directory ·
                <a href="${SITE_URL}" style="color:#9ca3af;">www.greenpestdirectory.com</a>
              </p>
            </td>
          </tr>
        </table>
        </td></tr>
        </table>
        </body>
        </html>
      `,
    });
  } catch (emailErr) {
    console.warn("Resend rejection email error:", emailErr);
    // Non-fatal
  }

  return NextResponse.json({ success: true, claim_id, status: "rejected" });
}
