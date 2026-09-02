// Replaces the placeholder photo URLs on seeded media with themed, relevant
// images (LoremFlickr serves Flickr photos by keyword). Broken images degrade to
// the card gradient, so this is safe. Run: node scripts/update-images.mjs
import "dotenv/config";
import pg from "pg";

const DB_URLS = [process.env.DIRECT_URL, process.env.DATABASE_URL].filter(Boolean);
function parsePgUrl(url) {
  const m = url.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:/]+):(\d+)\/([^?]+)/);
  if (!m) throw new Error("Could not parse database URL");
  return { user: m[1], password: m[2], host: m[3], port: Number(m[4]), database: m[5] };
}

// Occasion name → LoremFlickr keyword set
const KEYWORDS = {
  "Ganesh Puja": "ganesha,festival,india",
  "Laxmi Puja": "diwali,lights,india",
  "Navratri Garba": "garba,dance,festival",
  Holi: "holi,colours,festival",
  Diwali: "diwali,diya,lights",
};
const DEFAULT_KW = "india,festival,temple";

async function run(client) {
  const occ = await client.query('select id, name from "Occasion"');
  let updated = 0;
  for (const o of occ.rows) {
    const kw = KEYWORDS[o.name] ?? DEFAULT_KW;
    // all photo media under this occasion, oldest first for stable numbering
    const media = await client.query(
      `select m.id from "Media" m
       join "Session" s on s.id = m."sessionId"
       where s."occasionId" = $1 and m.type = 'photo'
       order by m."addedAt" asc`,
      [o.id],
    );
    let i = 0;
    for (const row of media.rows) {
      i++;
      const url = `https://loremflickr.com/800/600/${encodeURIComponent(kw)}?lock=${i}`;
      await client.query('update "Media" set url = $1 where id = $2', [url, row.id]);
      updated++;
    }
    console.log(`✓ ${o.name}: ${media.rows.length} photos → ${kw}`);
  }
  return updated;
}

let done = false;
for (const url of DB_URLS) {
  const cfg = parsePgUrl(url);
  const client = new pg.Client({ ...cfg, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const n = await run(client);
    await client.end();
    done = true;
    console.log(`\n✓ Updated ${n} photo URLs via ${cfg.host}.`);
    break;
  } catch (e) {
    try { await client.end(); } catch {}
    console.log(`… ${cfg.host} failed (${e.code || e.message}), trying next…`);
  }
}
if (!done) { console.error("✗ Could not update images."); process.exit(1); }
