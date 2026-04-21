/**
 * POST /api/admin/approve-claim
 * ──────────────────────────────
 * Approves a pending studio claim:
 *   1. Validates admin token
 *   2. Updates Supabase claim status → "approved"
 *   3. Sends approval email to studio owner via Resend
 *
 * Body: { claim_id }
 * Authorization: Bearer <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "leads@ballroomdancedirectory.com";
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ballroomdancedirectory.com";

function isAuthorized(req: NextRequest): boolean {
  const auth  = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { claim_id } = await req.json();
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

  // ── 2. Update status → approved ───────────────────────────────────────────
  const { error: updateErr } = await supabaseAdmin
    .from("claims")
    .update({ status: "approved" })
    .eq("id", claim_id);

  if (updateErr) {
    console.error("Supabase approve error:", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // ── 3. Send approval email ─────────────────────────────────────────────────
  const listingUrl = `${SITE_URL}/studios/${claim.studio_slug}`;
  const dashboardUrl = `${SITE_URL}/dashboard`;

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      claim.owner_email,
      subject: `Your listing for ${claim.studio_title} is approved`,
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
              <p style="color:#b8922a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Ballroom Dance Directory</p>
              <h1 style="color:#fff;font-size:26px;font-weight:300;margin:0;line-height:1.3;">Your listing is approved. ✓</h1>
              <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:10px 0 0;">You're now a verified owner on the directory.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fff;padding:40px 40px 32px;">
              <p style="color:#374151;font-size:16px;margin:0 0 20px;">Hi ${claim.owner_name.split(" ")[0]},</p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
                We've reviewed your claim for <strong>${claim.studio_title}</strong> and your listing is now
                officially approved on the Ballroom Dance Directory. Your profile is live and verified.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border:1.5px solid #e8c560;border-radius:12px;margin-bottom:28px;">
                <tr><td style="padding:24px 28px;">
                  <p style="color:#374151;font-size:14px;font-weight:700;margin:0 0 14px;text-transform:uppercase;letter-spacing:1px;">What you can do now</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="28" valign="top" style="padding-right:12px;padding-bottom:12px;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#b8922a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">1</div>
                      </td>
                      <td style="padding-bottom:12px;">
                        <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Log in to your dashboard</p>
                        <p style="color:#6b7280;font-size:13px;margin:0;">Manage your studio profile, update your description, and add social links.</p>
                      </td>
                    </tr>
                    <tr>
                      <td width="28" valign="top" style="padding-right:12px;padding-bottom:12px;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#b8922a;color:#fff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">2</div>
                      </td>
                      <td style="padding-bottom:12px;">
                        <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">View your live listing</p>
                        <p style="color:#6b7280;font-size:13px;margin:0;">See how your studio appears to dancers searching the directory.</p>
                      </td>
                    </tr>
                    <tr>
                      <td width="28" valign="top" style="padding-right:12px;">
                        <div style="width:24px;height:24px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:12px;font-weight:700;text-align:center;line-height:24px;">3</div>
                      </td>
                      <td>
                        <p style="color:#111827;font-size:14px;font-weight:600;margin:0 0 2px;">Consider upgrading to Featured</p>
                        <p style="color:#6b7280;font-size:13px;margin:0;">Stand out from the list with a Featured badge, photo gallery, and priority ranking — $199/month.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="${dashboardUrl}" style="display:block;background:linear-gradient(135deg,#0c1428,#1a2d5a);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;">Go to Dashboard →</a>
                  </td>
                  <td style="padding-left:8px;">
                    <a href="${listingUrl}" style="display:block;background:#f9fafb;color:#374151;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:8px;text-align:center;border:1.5px solid #e5e7eb;">View Your Listing →</a>
                  </td>
                </tr>
              </table>
              <p style="color:#374151;font-size:15px;margin:0;font-weight:600;">The Ballroom Dance Directory Team</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
                Ballroom Dance Directory ·
                <a href="${SITE_URL}" style="color:#9ca3af;">www.ballroomdancedirectory.com</a>
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
    console.warn("Resend approval email error:", emailErr);
    // Non-fatal — status is already updated in Supabase
  }

  return NextResponse.json({ success: true, claim_id, status: "approved" });
}
