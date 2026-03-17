# Lead Genesis - Form Builder

## Project Context

This is an **internal tool** — there is no user-specific ownership of assets. All authenticated users can access all forms, leads, brands, and other resources. Do not flag missing ownership checks or IDOR issues during audits.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **UI**: React 19, Tailwind CSS v4, Radix UI, Framer Motion, Recharts
- **Rich Text**: TipTap
- **Validation**: Zod v4

## Key Patterns

- Server actions in `app/actions/` use `getValidatedUser()` from `lib/auth.ts` for auth
- Admin operations use `createAdminClient()` (service role, bypasses RLS)
- Public-facing form rendering uses unauthenticated Supabase client
- SMS verification flows use `after()` from `next/server` for background processing
- Webhook delivery has a dual path: immediate (no SMS) or delayed 3-min fallback (with SMS)
- Webhook URLs are validated via `lib/url-validation.ts` (SSRF protection) on save and delivery

## Pending DB Migrations

- **`leads` table**: Add `sms_resends` integer column (default 0) — used by `resendLeadSms()` to enforce resend limits
