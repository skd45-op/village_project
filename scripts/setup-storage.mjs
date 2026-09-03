// One-time setup: creates the `occasion-media` public Storage bucket and the
// RLS policies that let authenticated users upload/delete objects in it.
// Run: node scripts/setup-storage.mjs
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const BUCKET = "occasion-media";
const AVATAR_BUCKET = "avatars";
const RECEIPT_BUCKET = "receipts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Try the direct connection first, then the pooler (the direct host is often
// IPv6-only and won't resolve on IPv4 networks).
const DB_URLS = [process.env.DIRECT_URL, process.env.DATABASE_URL].filter(Boolean);

if (!SUPABASE_URL || !SERVICE_KEY || DB_URLS.length === 0) {
  console.error("Missing env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL).");
  process.exit(1);
}

// 1) Create (or update) the public bucket via the Storage admin API.
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureBucket(name) {
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === name);
  if (exists) {
    await admin.storage.updateBucket(name, { public: true });
    console.log(`✓ Bucket "${name}" already existed — ensured public.`);
  } else {
    const { error } = await admin.storage.createBucket(name, { public: true });
    if (error) {
      console.error(`✗ Failed to create bucket "${name}":`, error.message);
      process.exit(1);
    }
    console.log(`✓ Created public bucket "${name}".`);
  }
}

await ensureBucket(BUCKET);
await ensureBucket(AVATAR_BUCKET);
await ensureBucket(RECEIPT_BUCKET);

// 2) Create RLS policies on storage.objects. Parse DIRECT_URL manually because
//    the password can contain "@", which breaks naive URL parsing.
function parsePgUrl(url) {
  const m = url.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:/]+):(\d+)\/([^?]+)/);
  if (!m) throw new Error("Could not parse database URL");
  return { user: m[1], password: m[2], host: m[3], port: Number(m[4]), database: m[5] };
}

const sql = `
  drop policy if exists "occasion media authenticated upload" on storage.objects;
  create policy "occasion media authenticated upload"
    on storage.objects for insert to authenticated
    with check (bucket_id = '${BUCKET}');

  drop policy if exists "occasion media authenticated delete" on storage.objects;
  create policy "occasion media authenticated delete"
    on storage.objects for delete to authenticated
    using (bucket_id = '${BUCKET}');

  drop policy if exists "avatars public upload" on storage.objects;
  create policy "avatars public upload"
    on storage.objects for insert to anon, authenticated
    with check (bucket_id = '${AVATAR_BUCKET}');

  drop policy if exists "receipts authenticated upload" on storage.objects;
  create policy "receipts authenticated upload"
    on storage.objects for insert to authenticated
    with check (bucket_id = '${RECEIPT_BUCKET}');

  drop policy if exists "receipts authenticated delete" on storage.objects;
  create policy "receipts authenticated delete"
    on storage.objects for delete to authenticated
    using (bucket_id = '${RECEIPT_BUCKET}');
`;

let applied = false;
for (const url of DB_URLS) {
  const cfg = parsePgUrl(url);
  const client = new pg.Client({ ...cfg, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(sql);
    await client.end();
    applied = true;
    console.log(`✓ RLS policies applied via ${cfg.host} (authenticated upload + delete).`);
    break;
  } catch (e) {
    try { await client.end(); } catch {}
    console.log(`… ${cfg.host} failed (${e.code || e.message}), trying next connection…`);
  }
}

if (!applied) {
  console.error("\n✗ Could not apply RLS policies over any DB connection.");
  console.error("  Run this SQL manually in Supabase Dashboard → SQL Editor:\n");
  console.error(sql);
  process.exit(1);
}
console.log("\nDone. Photo uploads are ready.");
