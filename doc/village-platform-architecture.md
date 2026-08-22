# Village Community Platform — Architecture & Tech Stack

**Version:** 1.0 (Phase 1 + Phase 2 plan)
**Last updated:** August 2026

---

## 1. Project Overview

A mobile-first, fully responsive web platform for a village community to:

- Showcase occasions/festivals (e.g. Ganesh Puja, Laxmi Puja) as yearly **sessions** with photos, videos (YouTube links only — zero storage cost), and live streams.
- Maintain a transparent, tamper-evident **budget/treasury ledger** per session, visible only to Members, Admins, and Super Admin.
- Manage a **member directory** with a controlled join-request → approval workflow.
- Support role-based **content and financial governance** with strict add/lock/correct rules.
- Run polls, send notifications, and provide a public contact form.
- **Phase 2:** a cricket scoring module (teams, players, live ball-by-ball scoring, stats) similar to CricHeroes.

Target: fully responsive from small mobile (~360px) up to large desktop (1920px). Cost-free or near-zero hosting cost is a hard constraint.

---

## 2. Roles & Permission Model

### 2.1 Roles

| Role | Description |
|---|---|
| **Super Admin** | Full control. One or more trusted individuals (typically the platform owner/committee head). Only role that can edit or delete *any* record. Only role that can promote a Member to Admin, assign/revoke module permissions, or demote/remove an Admin. |
| **Admin** | A Member promoted by Super Admin, granted one or more **module permissions**. Admins can only **add** records in their granted modules — never edit or delete. |
| **Member** | Approved village resident/contributor. Can view budget (read-only), full media, member directory, vote on polls, submit correction requests if also an Admin. |
| **Guest / Public** | Unauthenticated or unapproved visitor. Can view media, occasions, live streams, public announcements, and a limited member directory (name + photo only). **No access to budget in any form** (not even aggregates). No individual contact info. |

### 2.2 Modules an Admin can be granted (independently, by Super Admin)

- `media` — add photos / YouTube links / mark a session live
- `budget` — add income/expense entries (with proof)
- `members` — review and approve/reject membership requests
- `occasions` — create occasions and yearly sessions
- `polls` — create polls
- *(Phase 2)* `cricket` — add players, teams, matches, live-score a match

A single user can hold multiple modules. Permissions are stored per-user, not as preset "tiers."

### 2.3 Core governance rule (applies to every module)

> **Admins can only CREATE. Only Super Admin can EDIT or DELETE.**

Every record created by an Admin is stored with `is_locked = true` at the database/API layer (not just hidden in UI) — enforced server-side so no endpoint can be called directly to bypass it.

### 2.4 Correction workflow (for when an Admin makes a mistake)

Two mechanisms, combined:

**A. Edit Request Flow (for media, members, occasions — non-financial records)**
1. Admin flags a record as "Needs Correction" with a note explaining the issue.
2. Super Admin receives a notification.
3. Super Admin edits directly, or rejects the request with a reason.
4. Status trail: `flagged → resolved` or `flagged → rejected`.

**B. Correction Entries (for budget records specifically — accounting-style, no silent edits ever)**
- A budget entry, once created, is **permanently immutable** — even Super Admin does not edit or delete the original row.
- To fix an error, a **linked correction entry** is created (by Super Admin only): e.g. `Correction: -₹500, reason: "duplicate entry", linked_to: entry_id`.
- The ledger UI shows the original entry *and* its correction(s) together, with running net total.
- This preserves full audit history — nothing ever silently disappears or changes, which matters most for money.

### 2.5 Permission Matrix

| Action | Super Admin | Admin (module granted) | Member | Guest |
|---|:---:|:---:|:---:|:---:|
| Add media (photo/YT link/live flag) | ✅ | ✅ (`media`) | ❌ | ❌ |
| Edit/Delete media | ✅ | ❌ | ❌ | ❌ |
| Add budget entry (with proof) | ✅ | ✅ (`budget`) | ❌ | ❌ |
| Add budget correction entry | ✅ | ❌ | ❌ | ❌ |
| View budget (entries + corrections) | ✅ | ✅ | ✅ | ❌ |
| Approve/reject membership request | ✅ | ✅ (`members`) | ❌ | ❌ |
| Edit/remove a member | ✅ | ❌ | ❌ | ❌ |
| Promote Member → Admin / assign modules | ✅ | ❌ | ❌ | ❌ |
| View member directory (full) | ✅ | ✅ | ✅ | ❌ |
| View member directory (name + photo only) | — | — | — | ✅ |
| Create occasion/session | ✅ | ✅ (`occasions`) | ❌ | ❌ |
| Edit/Delete occasion/session | ✅ | ❌ | ❌ | ❌ |
| Create poll | ✅ | ✅ (`polls`) | ❌ | ❌ |
| Vote on poll | ✅ | ✅ | ✅ | ❌ |
| View media/live stream | ✅ | ✅ | ✅ | ✅ |
| Submit contact form | ✅ | ✅ | ✅ | ✅ |
| Request membership | — | — | — | ✅ |
| *(Phase 2)* Add players/teams/matches | ✅ | ✅ (`cricket`) | ❌ | ❌ |
| *(Phase 2)* Live-score a match | ✅ | ✅ (`cricket`) | ❌ | ❌ |
| *(Phase 2)* View scoreboard/stats | ✅ | ✅ | ✅ | ✅ |

---

## 3. Feature Breakdown

### 3.1 Occasions & Sessions
- **Occasion** = template/category (e.g. "Ganesh Puja").
- **Session** = one yearly instance of an occasion (e.g. "Ganesh Puja 2026") with its own dates, media, and budget.
- Sessions have a status: `upcoming / ongoing / completed`.

### 3.2 Media
- Photos: direct upload (small, compressed, stored on free-tier object storage — see §5).
- Videos: **YouTube links only** — no direct video upload, keeps storage cost at zero.
- Live: Admin pastes a YouTube Live URL; it embeds automatically on the session page.
- Each media item is locked after creation (see §2.3).

### 3.3 Budget / Treasury
- Two entry types: `income` (donations, sponsorships, carry-forward) and `expense` (categorized: decoration, prasad, priest, electricity, etc.)
- Every entry requires a **proof/receipt photo upload**.
- Per-member donation ledger (amount, date, mode, receipt no.) — visible to Members/Admins/Super Admin only.
- Immutable entries + correction entries (see §2.4B).
- Session-level summary: Total Income, Total Expense, Balance — visible only to Members/Admins/Super Admin. **Not shown to Guests in any form**, per your requirement.
- Downloadable yearly statement (PDF export) for committee record-keeping.

### 3.4 Members
- **Join request flow (Guest → Member):**
  1. Guest clicks "Are you our village people? Want to become a member?"
  2. Fills form: First Name, Last Name, Age, Photo, Mobile No. (required), Email (optional), and additionally recommended: **Address/Ward**, **Relation to village** (native/moved out/relative), **Emergency Contact (optional)**.
  3. Submission shows: *"Thanks! Admin will verify within 1–2 days."*
  4. Super Admin (and any Admin with `members` module) gets an email + in-app notification.
  5. Review stages: `pending → needs_more_info → approved / rejected`. If `needs_more_info`, applicant is notified with the specific note (e.g. "please re-upload a clearer photo") and can resubmit.
  6. On approval, the account is created/upgraded to Member with login access.
- Super Admin can **promote a Member to Admin** at any time and assign/revoke specific modules.
- Public directory (Guest view): total member **count** + **name + photo only**, no phone/email (§8).
- Full directory (Member+ view): all fields except payment/budget-linked personal financial data unless separately permitted.

### 3.5 Notifications
- In-app + email for: new membership request, request approved/rejected/needs-info, new correction flagged, new poll, new session/occasion created, live stream started.
- Web Push (optional, via service worker) for real-time alerts without a native app.

### 3.6 Polls
- Created by Admins (`polls` module) or Super Admin.
- Visibility & voting: **Members+ only** for viewing and voting on all polls. Guests cannot vote (§8).

### 3.7 Contact
- Public contact form → stored + emailed to Super Admin (and relevant Admins).
- Committee directory page (name, role, no direct phone number) with a "Send Message" option that routes through the contact form rather than exposing numbers.

### 3.8 Multi-language (recommended addition)
- Odia / Hindi / English toggle — high value for a village audience, low implementation cost with i18n libraries.

---

## 4. Data Model (High-Level Schema)

```
Users(id, first_name, last_name, age, photo_url, mobile, email, address, role[guest/member/admin/superadmin], status[active/pending/rejected], created_at)

AdminPermissions(id, user_id, module[media|budget|members|occasions|polls|cricket], granted_by, granted_at)

MembershipRequests(id, user_data_snapshot, status[pending/needs_info/approved/rejected], admin_note, reviewed_by, reviewed_at)

Occasions(id, name, description, icon_url)

Sessions(id, occasion_id, year, title, start_date, end_date, status)

Media(id, session_id, type[photo/yt_link/live], url, added_by, added_at, is_locked=true, correction_flag, correction_note)

BudgetEntries(id, session_id, type[income/expense], category, amount, description, receipt_url, added_by, added_at, is_locked=true)

BudgetCorrections(id, original_entry_id, amount_delta, reason, added_by(superadmin only), added_at)

Donations(id, session_id, member_id, amount, mode[cash/upi/bank], date, receipt_no)

Polls(id, title, options[], visibility[members/all], created_by, expires_at)
PollVotes(id, poll_id, user_id, option)

ContactMessages(id, name, email, message, target[general/admin/member], status[new/read/resolved])

Notifications(id, user_id, type, message, read, created_at)
```

### Phase 2 additions

```
Players(id, name, role[batsman/bowler/allrounder/wicketkeeper], photo_url)
Teams(id, name, player_ids[])
Matches(id, date, time, team_a_id, team_b_id, overs_limit, toss_winner_team_id, toss_decision[bat/field], status[upcoming/live/completed])
Innings(id, match_id, batting_team_id, runs, wickets, overs, status)
Deliveries(id, innings_id, over_number, ball_number, batsman_id, non_striker_id, bowler_id, runs, extra_type[wide/noball/bye/legbye/none], wicket_type[bowled/caught/runout/stumped/lbw/hitwicket/none], fielder_id)
PlayerCareerStats(id, player_id, matches, runs, balls_faced, wickets, overs_bowled, catches, ...) -- can be a materialized/aggregated view instead of a stored table
```

---

## 5. Tech Stack (Cost-Free / Free-Tier First)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js (React) + Tailwind CSS** | SSR/SSG for fast loads, built-in API routes, excellent responsive tooling, free hosting fit |
| Hosting | **Vercel (free tier)** | Zero-cost hosting for Next.js, auto HTTPS, CDN, generous free tier for a village-scale audience |
| Database | **PostgreSQL via Supabase (free tier)** or **Neon (free tier)** | Free managed Postgres, includes auth & storage add-ons, generous limits for this scale |
| ORM | **Prisma** | Type-safe schema matching §4, easy migrations |
| Auth | **Supabase Auth** or **NextAuth.js** | Email + password login for now (§8). Mobile/OTP is a later option — architecture keeps it swappable. |
| Photo storage | **Supabase Storage (free tier)** or **Cloudinary free tier** | Free image hosting with on-the-fly resizing/compression |
| Video | **YouTube (embed only, no upload)** | Zero storage/bandwidth cost — aligns with your cost-free requirement |
| Email | **Resend (free tier)** or **Supabase built-in email** | For admin approval notifications, contact form |
| Push notifications | **Web Push API / OneSignal (free tier)** | No native app needed |
| PDF export (budget statement) | **@react-pdf/renderer** or server-side **Puppeteer** on a serverless function | Generates yearly financial statement |
| i18n | **next-intl** or **react-i18next** | Odia / Hindi / English support |
| Realtime (live scoring, Phase 2) | **Supabase Realtime** (Postgres change subscriptions) | Free, avoids need for separate WebSocket server |

**Why this stack stays free:** Vercel + Supabase/Neon free tiers comfortably handle a single-village-scale audience (hundreds to low thousands of users, moderate media traffic), YouTube absorbs all video cost, and there's no dedicated server to pay for — everything is serverless/managed.

---

## 6. Security & Integrity Principles

1. **Server-side enforcement, not UI-only** — every permission check (module access, lock status, role) is enforced in API routes / database row-level security, never trusted from the client.
2. **Immutability where it matters** — budget entries and any `is_locked` record cannot be updated via any API path except the designated correction endpoints, which are Super-Admin-only.
3. **Audit trail** — every create/correct/approve/reject action stores `actor_id` and `timestamp`, and is visible to Members+ for transparency (who added what).
4. **Least-privilege visibility** — Guests never receive budget data in API responses at all (not just hidden in UI), to prevent data leakage via network inspection.
5. **Sensitive data handling** — member age, mobile, and address are visible only to Member+ roles; Guests see name + photo only.

---

## 7. Suggested Build Order

**Phase 1**
1. Auth + roles + Super Admin bootstrap
2. Occasions/Sessions + Media (photo upload + YouTube embed)
3. Member join-request → approval workflow + notifications
4. Admin module-permission system + locked records
5. Budget module + correction-entry system + PDF export
6. Polls + Contact form
7. Public/Guest view pass (ensure budget fully excluded from guest API responses)
8. Responsive QA pass: 360px → 1920px
9. Multi-language pass

**Phase 2**
1. Players + Teams management
2. Match setup (toss, playing XI selection)
3. Ball-by-ball scoring interface (runs, extras, wickets)
4. Live scoreboard view (public)
5. Aggregated career stats

---

## 8. Resolved Decisions

- **Guest voting on casual polls:** ❌ Not allowed. Voting is Members+ only, for all polls.
- **Login method for Members:** Email + password (for now). Mobile/OTP may be revisited later.
- **Public directory (Guest view):** Show member **count** plus **name + photo only** — no phone/email/other fields.
- **Rejected membership requests retention:** No automatic retention policy. Rejected requests are kept and **Super Admin deletes them manually** when needed.
