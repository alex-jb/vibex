# Security Policy

## Reporting a vulnerability

**Don't file a public GitHub issue for security bugs.** Public disclosure
exposes other VibeXForge users while a fix is being prepared.

Instead:

1. **Email:** `security@vibexforge.com` (or DM `@alex-jb` on GitHub if
   you can't reach the email).
2. **Include:**
   - A description of the issue and the impact (data exposure, account
     takeover, RCE, etc.)
   - Steps to reproduce — minimal proof-of-concept is ideal
   - The affected URL / endpoint / file path / commit SHA if known
   - Your name + handle if you'd like credit in the fix announcement

3. **Response time:** I'm a solo maintainer. I aim to:
   - Acknowledge within **24 hours**.
   - Triage + provide a target fix date within **72 hours**.
   - Ship a fix to production within **7 days** for high-severity, **30
     days** for low-severity.

   If I'm slower than this on a high-severity issue, ping me again — I
   may have missed the email.

## In scope

- The deployed app at https://www.vibexforge.com
- The `master` branch source in this repository
- Anything that could expose another creator's drafts, projects,
  email, posted-URL data, or auth tokens
- Anything that could let one creator consume another's daily draft
  quota or trigger generation on their behalf
- RLS policies on `creators`, `projects`, `project_drafts`,
  `draft_engagement_snapshots`, `ideas`
- The cron routes in `app/api/cron/*` (CRON_SECRET enforcement)
- The Supabase RPC functions (`consume_draft_credits`,
  `get_draft_credits`)

## Out of scope

- Vulnerabilities in third-party dependencies that don't affect
  VibeXForge's behavior — please report those upstream
- Self-XSS where the attacker is logged into the victim's session
- Reports of missing security headers without a working exploit
- Rate-limit avoidance below the daily Claude quota cap (intentional
  for beta)
- Anything affecting the `/arcade` legacy splash that isn't reachable
  from the main user flow
- Social engineering of @alex-jb personally

## Things I want reports about

- **RLS bypass** — any way to read or write another creator's row
- **Auth bypass** — any way to call `/api/projects/[id]/generate-drafts`,
  `/api/drafts/[id]/reroll`, or `/api/drafts/[id]/generate-cover`
  on a project you don't own
- **CRON_SECRET bypass** — any way to invoke a cron route from a
  non-Vercel-cron caller
- **Cost amplification** — any way to make a single creator burn
  another creator's quota, or to make one request trigger many
  Claude / OpenAI calls
- **Posted-URL injection** — any way to set `posted_url` to a
  malicious domain that downstream scrapers / display would render
  unsafely
- **Service-role key exposure** — any path where the
  `SUPABASE_SERVICE_ROLE_KEY` could leak to the client bundle

## Things I don't want reports about

- Brute-force login (Supabase Auth handles this)
- Password complexity requirements (Supabase magic-link only)
- Logout doesn't invalidate the session in another tab (browser-level)
- "I can see another user's public profile" — public profiles are
  public by design

## Hall of fame

Credit listed here for accepted reports. None yet — be the first.

## License

MIT — see [LICENSE](./LICENSE). Reporting in good faith is welcome
under safe-harbor: I won't pursue legal action against researchers
who follow this policy.
