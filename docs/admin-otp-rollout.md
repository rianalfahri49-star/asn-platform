# Admin email OTP rollout

This rollout is intentionally staged. Do not apply the OTP database migration until the sender is verified and the Edge Function secrets are configured. Applying the migration before the email sender is ready can block administrator access.

## Required setup

1. Verify an email-sending domain with Resend and choose a sender address on that domain.
2. Configure the Supabase Edge Function secrets for `admin-email-otp`:
   - `RESEND_API_KEY`
   - `OTP_FROM_EMAIL` (the verified sender address)
   - `OTP_PEPPER` (a unique, high-entropy random value; keep it private)
   - Confirm the function runtime has `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` available.
3. Deploy `supabase/functions/admin-email-otp`.
4. Apply migration `202611240004_admin_email_otp.sql` only after steps 1–3 are complete.
5. Test email/password + OTP on the website and APK Admin. Confirm that an unverified session is denied access to every admin RPC and table, and that a verified session expires after eight hours.
6. Keep the integration pull request in draft until these tests pass.

## Important

- Never put secret values in GitHub, source code, chat, or client-side environment variables.
- Never expose the service-role key to the browser or APK.
- Google OAuth is deliberately excluded from this rollout and can be handled later from a computer.
- The migration is tracked but is not applied to production yet.
