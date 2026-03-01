# Supabase Connectivity Issue — India Region

## Problem

Supabase-hosted PostgreSQL databases are currently **unreachable from Indian ISPs** due to connection timeout issues. This affects all direct database connections (Prisma, pgAdmin, etc.) and Supabase Auth/REST APIs hosted on `*.supabase.co`.

## Symptoms

- `npx prisma db push` hangs indefinitely or times out
- `npx prisma migrate deploy` fails with `ETIMEDOUT`
- Server startup fails at Prisma client connection with `Can't reach database server`
- Supabase Dashboard may load but DB operations timeout
- Error: `connect ETIMEDOUT <supabase-db-ip>:5432`

## Root Cause

Several Indian ISPs (Jio, Airtel, BSNL, Vi) are intermittently blocking or throttling connections to Supabase's AWS infrastructure endpoints. This is an ISP-level routing/timeout issue, **not a Supabase or application bug**.

## Workarounds

1. **Use a VPN** — Connect via a non-Indian exit node (US/EU), then run Prisma commands and start the server.
2. **Mobile Hotspot** — Switch to a different ISP's network; some carriers are unaffected.
3. **Supabase Connection Pooler** — Use the pooled connection string (port `6543`) instead of the direct connection (port `5432`). Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
4. **Increase Prisma timeout** — Add `connect_timeout=60` to the connection string if the issue is intermittent:
   ```
   DATABASE_URL="postgresql://...?connect_timeout=60"
   ```

## Status

- **Affected since:** February–March 2026 (intermittent)
- **Supabase status page:** https://status.supabase.com
- **Community reports:** Multiple users in India reporting identical timeouts on GitHub and Discord

## Impact on This Project

The Eventora backend depends on a Supabase-hosted PostgreSQL database. When the connection is unavailable, the server cannot start and all API endpoints will fail. The frontend will fall back to empty state (no data).
