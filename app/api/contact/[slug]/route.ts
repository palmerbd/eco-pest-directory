// ─── POST /api/contact/[slug] ─────────────────────────────────────────────────
// Lead capture form submission for Featured (paid) studio listings.
// Validates the studio is on the paid tier, then emails the owner via Resend.
//
// Request body: { name, email, phone?, message }
// Returns:      { success: true } | { error: string }

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

const WP_API_URL = process.env.WP_API_URL || "http://178.156.197.177/wp-json";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "leads@greenpestdirectory.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY!;

// Rate-limit: simple in-memory map — good enough for a low-traffic directory.
// (Upgrade to Redis/Upstash if you need persistence across serverless instances.)
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 submission per IP per minute per studio

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}:${slug}`;
  const last = recentSubmissions.get(key);
  if (last && Date.now() - last < RATE_LIMIT_MS) {
    return NextResponse.json({ error: "Please wait before sending another message." }, { status: 429 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { name?: string; email?: string; phone?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // ── Verify studio is on paid tier ─────────────────────────────────────────
  // We check the claims table — it's the authoritative source for tier.
  const { data: claim } = await supabaseAdmin
    .from("claims")
    .select("owner_email, studio_title, tier")
    .eq("studio_slug", slug)
    .in("status", ["verified", "approved"])
    .eq("tier", "paid")
    .maybeSingle();

  if (!claim) {
    // Graceful fallback — try to get studio email from WP directly
    // (e.g. if the Supabase claim row hasn't been updated yet)
    const wpRes = await fetch(`${WP_API_URL}/wp/v2/pest_company?slug=${slug}&_fields=acf`).catch(() => null);
    if (!wpRes?.ok) {
      return NextResponse.json(
        { error: "This studio is not currently accepting messages." },
        { status: 403 }
      );
    }
    const studios = await wpRes.json() as Array<{ acf?: { studio_tier?: string; email?: string; studio_title?: string } }>;
    const wpStudio = studios[0];
    if (!wpStudio?.acf || wpStudio.acf.studio_tier !== "paid" || !wpStudio.acf.email) {
      return NextResponse.json(
        { error: "This studio is not currently accepting messages." },
        { status: 403 }
      );
    }

    // Send via WP email fallback path
    return await sendEmail({
      toEmail:      wpStudio.acf.email,
      studioTitle:  wpStudio.acf.studio_title || slug,
      senderName:   name.trim(),
      senderEmail:  email.trim(),
      senderPhone:  phone?.trim() || "",
      userMessage:  message.trim(),
      slug,
      ip,
      key,
    });
  }

  // ── Send email ────────────────────────────────────────────────────────────
  return await sendEmail({
    toEmail:     claim.owner_email,
    studioTitle: claim.studio_title,
    senderName:  name.trim(),
    senderEmail: email.trim(),
    senderPhone: phone?.trim() || "",
    userMessage: message.trim(),
    slug,
    ip,
    key,
  });
}

// ── Shared send helper ────────────────────────────────────────────────────────

async function sendEmail({
  toEmail,
  studioTitle,
  senderName,
  senderEmail,
  senderPhone,
  userMessage,
  slug,
  ip,
  key,
}: {
  toEmail: string;
  studioTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  userMessage: string;
  slug: string;
  ip: string;
  key: string;
}): Promise<NextResponse> {
  const resend = new Resend(RESEND_API_KEY || "re_placeholder");

  const subject = `New inquiry for ${studioTitle} — Green Pest Control Directory`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:linear-gradient(135deg,#0c1428,#1a2d5a);padding:24px 32px;border-radius:12px 12px 0 0">
        <div style="color:#e8c560;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px">
          ⭐ New Lead — Green Pest Control Directory
        </div>
        <h1 style="color:#fff;margin:0;font-size:20px">${studioTitle}</h1>
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 32px">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;width:90px">Name</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-weight:600;font-size:14px">${senderName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px">
              <a href="mailto:${senderEmail}" style="color:#b8922a">${senderEmail}</a>
            </td>
          </tr>
          ${senderPhone ? `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px">Phone</td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px">${senderPhone}</td>
          </tr>` : ""}
        </table>

        <div style="background:#f9f6f0;border-radius:8px;padding:16px;margin-bottom:20px">
          <div style="color:#6b7280;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Message</div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#374151">${userMessage.replace(/\n/g, "<br>")}</p>
        </div>

        <div style="display:flex;gap:12px">
          <a href="mailto:${senderEmail}?subject=Re: Pest control inquiry"
            style="display:inline-block;background:linear-gradient(135deg,#b8922a,#e8c560);color:#1a1a1a;
                   font-weight:bold;font-size:13px;padding:10px 20px;border-radius:8px;text-decoration:none">
            Reply to ${senderName} →
          </a>
        </div>

        <p style="margin-top:24px;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px">
          This message was sent via your Featured listing at
          <a href="https://www.greenpestdirectory.com/studios/${slug}"
            style="color:#b8922a;text-decoration:none">greenpestdirectory.com</a>.
          IP: ${ip}
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      toEmail,
      replyTo: senderEmail,
      subject,
      html,
    });

    // Record submission time for rate limiting
    recentSubmissions.set(key, Date.now());

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 });
  }
}
