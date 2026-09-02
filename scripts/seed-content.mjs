// Seeds test occasions + multi-year sessions + media (photos & YouTube videos)
// so the homepage and occasion pages look populated. Idempotent by occasion name.
// Run AFTER the DB is reachable:  node scripts/seed-content.mjs
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

const CURRENT_YEAR = 2026;
const VIDEOS = [
  "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  "https://www.youtube.com/watch?v=ScMzIvxBSi4",
  "https://www.youtube.com/watch?v=jNQXAC9IVRw",
];

const OCCASIONS = [
  { name: "Ganesh Puja", slug: "ganesh", icon: "🪔", desc: "Our ten-day celebration of devotion, music, and coming together.", years: [2024, 2025, 2026] },
  { name: "Laxmi Puja", slug: "laxmi", icon: "🪷", desc: "The festival of light and prosperity.", years: [2025, 2026] },
  { name: "Navratri Garba", slug: "navratri", icon: "💃", desc: "Nine evenings of folk music, dance, and family traditions.", years: [2024, 2025] },
  { name: "Holi", slug: "holi", icon: "🎨", desc: "Colours, water, and sweets across the whole village.", years: [2025] },
  { name: "Diwali", slug: "diwali", icon: "🎇", desc: "Lamps, rangoli, and fireworks light up every home.", years: [2024, 2025] },
];

function statusFor(year) {
  return year < CURRENT_YEAR ? "completed" : year === CURRENT_YEAR ? "ongoing" : "upcoming";
}

async function run(client) {
  let nO = 0, nS = 0, nM = 0;
  for (const occ of OCCASIONS) {
    const existing = await client.query('select id from "Occasion" where name = $1 limit 1', [occ.name]);
    if (existing.rows.length) {
      console.log(`• "${occ.name}" already exists — skipping.`);
      continue;
    }
    const occId = randomUUID();
    await client.query(
      'insert into "Occasion" (id, name, description, "iconUrl", "createdAt") values ($1,$2,$3,$4, now())',
      [occId, occ.name, occ.desc, occ.icon],
    );
    nO++;

    for (const year of occ.years) {
      const sessId = randomUUID();
      await client.query(
        'insert into "Session" (id, "occasionId", year, title, status, "createdAt") values ($1,$2,$3,$4,$5::"SessionStatus", now())',
        [sessId, occId, year, String(year), statusFor(year)],
      );
      nS++;

      // 5 photos
      for (let i = 1; i <= 5; i++) {
        await client.query(
          'insert into "Media" (id, "sessionId", type, url, "addedAt") values ($1,$2,$3::"MediaType",$4, now())',
          [randomUUID(), sessId, "photo", `https://picsum.photos/seed/${occ.slug}-${year}-${i}/800/600`],
        );
        nM++;
      }
      // 1 video
      await client.query(
        'insert into "Media" (id, "sessionId", type, url, "addedAt") values ($1,$2,$3::"MediaType",$4, now())',
        [randomUUID(), sessId, "yt_link", VIDEOS[(year + occ.slug.length) % VIDEOS.length]],
      );
      nM++;
    }
    console.log(`✓ ${occ.name}: ${occ.years.length} sessions.`);
  }
  return { nO, nS, nM };
}

let done = false;
for (const url of DB_URLS) {
  const cfg = parsePgUrl(url);
  const client = new pg.Client({ ...cfg, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const { nO, nS, nM } = await run(client);
    await client.end();
    done = true;
    console.log(`\n✓ Seeded via ${cfg.host}: ${nO} occasions, ${nS} sessions, ${nM} media (TEST data).`);
    break;
  } catch (e) {
    try { await client.end(); } catch {}
    console.log(`… ${cfg.host} failed (${e.code || e.message}), trying next…`);
  }
}
if (!done) {
  console.error("✗ Could not seed content over any DB connection.");
  process.exit(1);
}
