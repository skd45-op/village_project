"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET } from "@/lib/constants";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

// Single replaceable profile photo. Uploads the picked image straight to Supabase
// Storage and exposes the resulting public URL via a hidden <input name={name}>
// so a surrounding form submits it. Users can re-pick as many times as they like.
export function AvatarUploader({
  name = "photoUrl",
  defaultUrl = null,
  label,
}: {
  name?: string;
  defaultUrl?: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState<string | null>(defaultUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 15 MB.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && (
        <p className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label}
        </p>
      )}
      <div className="flex items-center gap-4">
        {/* Preview circle */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Profile photo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl text-neutral-400">👤</span>
          )}
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-black/15 px-3 py-1.5 text-sm font-medium transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-white/15"
          >
            {busy ? "Uploading…" : url ? "Change photo" : "Upload photo"}
          </button>
          <p className="text-xs text-neutral-400">JPG or PNG, up to 15 MB</p>
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {/* Value carried into the surrounding form submit */}
      <input type="hidden" name={name} value={url ?? ""} readOnly />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) pick(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
