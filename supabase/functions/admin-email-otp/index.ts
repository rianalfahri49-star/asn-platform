import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function decodeClaims(jwt: string): Record<string, unknown> {
  const payload = jwt.split(".")[1];
  if (!payload) throw new Error("Invalid access token");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return JSON.parse(decoded);
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

async function hashCode(code: string, userId: string, sessionId: string, pepper: string) {
  const bytes = new TextEncoder().encode(`${pepper}:${userId}:${sessionId}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((v) => v.toString(16).padStart(2, "0")).join("");
}

function generateCode(): string {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return (value[0] % 1_000_000).toString().padStart(6, "0");
}

async function sendEmail(to: string, code: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("OTP_FROM_EMAIL");
  if (!apiKey || !from) throw new Error("Email sender is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Kode verifikasi Admin Sukses CPNS",
      text: `Kode OTP Admin Sukses CPNS Anda: ${code}. Kode berlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#0f172a"><h2>Verifikasi Admin Sukses CPNS</h2><p>Gunakan kode berikut untuk menyelesaikan proses masuk:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f1f5f9;border-radius:12px;text-align:center">${code}</div><p>Kode berlaku selama <b>5 menit</b> dan hanya dapat digunakan sekali.</p><p>Jangan bagikan kode ini kepada siapa pun. Jika Anda tidak mencoba masuk, abaikan email ini.</p></div>`,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Email provider error", response.status, detail);
    throw new Error("Email delivery failed");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!accessToken) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const pepper = Deno.env.get("OTP_PEPPER");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !pepper) {
    return json({ error: "Server authentication is not configured" }, 503);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

  const user = userData.user;
  if (user.app_metadata?.role !== "admin" || !user.email || !user.email_confirmed_at) {
    return json({ error: "Akun tidak memiliki akses administrator" }, 403);
  }

  let claims: Record<string, unknown>;
  try {
    claims = decodeClaims(accessToken);
  } catch {
    return json({ error: "Invalid access token" }, 401);
  }
  const sessionId = typeof claims.session_id === "string" ? claims.session_id : "";
  if (!sessionId) return json({ error: "Session is invalid. Please sign in again." }, 401);

  let body: { action?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (body.action === "status") {
    const { data: verified, error: statusError } = await admin
      .from("admin_verified_sessions")
      .select("expires_at")
      .eq("user_id", user.id)
      .eq("session_id", sessionId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (statusError) {
      console.error("OTP session status check failed", statusError);
      return json({ error: "Verifikasi admin belum siap. Hubungi administrator sistem." }, 503);
    }
    return json({ verified: Boolean(verified) });
  }

  if (body.action === "send") {
    const code = generateCode();
    const codeHash = await hashCode(code, user.id, sessionId, pepper);
    const { data: challengeRows, error: challengeError } = await admin.rpc(
      "admin_create_email_otp_challenge",
      {
        p_user_id: user.id,
        p_session_id: sessionId,
        p_code_hash: codeHash,
      },
    );

    if (challengeError) {
      const message = challengeError.message ?? "";
      if (message.includes("OTP_RATE_LIMIT")) {
        return json({ error: "Terlalu banyak permintaan OTP. Coba lagi nanti." }, 429);
      }
      if (message.includes("OTP_COOLDOWN")) {
        return json({ error: "Tunggu 60 detik sebelum meminta OTP baru." }, 429);
      }
      console.error("OTP challenge creation failed", challengeError);
      return json({ error: "Tidak dapat membuat kode verifikasi." }, 500);
    }

    const challenge = Array.isArray(challengeRows) ? challengeRows[0] : null;
    if (!challenge?.challenge_id) {
      return json({ error: "Tidak dapat membuat kode verifikasi." }, 500);
    }

    try {
      await sendEmail(user.email, code);
    } catch (error) {
      console.error(error);
      await admin
        .from("admin_email_otp_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", challenge.challenge_id)
        .is("consumed_at", null);
      return json({ error: "Email OTP belum dapat dikirim. Hubungi administrator sistem." }, 503);
    }

    return json({ success: true, message: "Kode verifikasi telah dikirim ke email admin." });
  }

  if (body.action === "verify") {
    const code = (body.code ?? "").trim();
    if (!/^\d{6}$/.test(code)) return json({ error: "Kode OTP harus terdiri dari 6 digit." }, 400);

    const { data: challenge, error: challengeError } = await admin
      .from("admin_email_otp_challenges")
      .select("id, code_hash, attempts, expires_at")
      .eq("user_id", user.id)
      .eq("session_id", sessionId)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (challengeError || !challenge) return json({ error: "Kode OTP tidak valid atau sudah kedaluwarsa." }, 400);
    if (new Date(challenge.expires_at).getTime() <= Date.now()) {
      await admin.from("admin_email_otp_challenges").update({ consumed_at: new Date().toISOString() }).eq("id", challenge.id);
      return json({ error: "Kode OTP sudah kedaluwarsa. Minta kode baru." }, 400);
    }
    if (challenge.attempts >= 5) return json({ error: "Batas percobaan OTP tercapai. Minta kode baru." }, 429);

    const expectedHash = await hashCode(code, user.id, sessionId, pepper);
    if (!constantTimeEqual(expectedHash, challenge.code_hash)) {
      const { data: attempts, error: attemptError } = await admin.rpc(
        "admin_increment_email_otp_attempt",
        { p_challenge_id: challenge.id },
      );
      if (attemptError) {
        console.error("OTP attempt counter failed", attemptError);
        return json({ error: "Tidak dapat memproses verifikasi. Coba lagi." }, 500);
      }
      if (attempts == null || attempts >= 5) {
        return json({ error: "Batas percobaan OTP tercapai. Minta kode baru." }, 429);
      }
      return json({ error: "Kode OTP salah." }, 400);
    }

    const now = new Date();
    const { data: consumed, error: consumeError } = await admin
      .from("admin_email_otp_challenges")
      .update({ consumed_at: now.toISOString() })
      .eq("id", challenge.id)
      .eq("code_hash", expectedHash)
      .eq("attempts", challenge.attempts)
      .is("consumed_at", null)
      .select("id")
      .maybeSingle();

    if (consumeError || !consumed) return json({ error: "Kode OTP sudah digunakan. Minta kode baru." }, 409);

    const { error: sessionError } = await admin.from("admin_verified_sessions").upsert({
      user_id: user.id,
      session_id: sessionId,
      verified_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    });
    if (sessionError) {
      console.error("Verified session write failed", sessionError);
      return json({ error: "Verifikasi gagal disimpan. Silakan masuk kembali." }, 500);
    }

    return json({ success: true, message: "Verifikasi berhasil." });
  }

  return json({ error: "Unknown action" }, 400);
});
