// Seeds a few example announcements so the homepage / updates feed isn't empty.
// Run AFTER `prisma migrate dev` (needs the Announcement table + DB resumed):
//   node scripts/seed-announcements.mjs
import "dotenv/config";
import { randomUUID } from "node:crypto";
import pg from "pg";

const DB_URLS = [process.env.DIRECT_URL, process.env.DATABASE_URL].filter(Boolean);
if (DB_URLS.length === 0) {
  console.error("Missing DATABASE_URL / DIRECT_URL.");
  process.exit(1);
}

function parsePgUrl(url) {
  const m = url.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:/]+):(\d+)\/([^?]+)/);
  if (!m) throw new Error("Could not parse database URL");
  return { user: m[1], password: m[2], host: m[3], port: Number(m[4]), database: m[5] };
}

const now = Date.now();
const day = 86400000;
const rows = [
  {
    title: "Community meeting this Sunday",
    body: "Let's plan the 2026 Ganesh Puja together. Everyone is welcome.",
    category: "meeting",
    happensAt: new Date(now + 3 * day),
    pinned: true,
  },
  {
    title: "Bhajan group practice",
    body: "Practice is open to all voices, every Thursday evening.",
    category: "bhajan",
    happensAt: new Date(now - 2 * day),
    pinned: false,
  },
  {
    title: "Aarti starts at 7:00 PM",
    body: "Join us near the temple for the evening aarti.",
    category: "aarti",
    happensAt: new Date(now - 2 * day),
    pinned: false,
  },
];

const sql = `insert into "Announcement" (id, title, body, category, "happensAt", pinned, "createdAt")
             values ($1,$2,$3,$4,$5,$6, now())`;

let done = false;
for (const url of DB_URLS) {
  const cfg = parsePgUrl(url);
  const client = new pg.Client({ ...cfg, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    for (const r of rows) {
      await client.query(sql, [randomUUID(), r.title, r.body, r.category, r.happensAt, r.pinned]);
    }
    await client.end();
    done = true;
    console.log(`✓ Seeded ${rows.length} announcements via ${cfg.host}.`);
    break;
  } catch (e) {
    try { await client.end(); } catch {}
    console.log(`… ${cfg.host} failed (${e.code || e.message}), trying next…`);
  }
}
if (!done) {
  console.error("✗ Could not seed announcements over any DB connection.");
  process.exit(1);
}
