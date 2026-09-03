"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RECEIPT_BUCKET } from "@/lib/constants";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

// Optional proof-of-payment upload (image or PDF) for a budget entry. Uploads
// straight to Supabase Storage and carries the resulting public URL via a
// hidden <input name={name}> so the surrounding form submits it as usual.
export function ReceiptUploader({ name = "receiptUrl" }: { name?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    const isAllowed = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isAllowed) {
      setError("Only images or PDF files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be under 15 MB.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(RECEIPT_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      const { data } = supabase.storage.from(RECEIPT_BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
      setFileName(file.name);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setUrl(null);
    setFileName(null);
    setError(null);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-black/15 px-3 py-1.5 text-sm font-medium transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-white/15"
        >
          <UploadIcon />
          {busy ? "Uploading…" : url ? "Replace file" : "Upload receipt"}
        </button>

        {url && fileName && (
          <span className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
            <a href={url} target="_blank" rel="noopener noreferrer" className="truncate text-brand-600 hover:underline">
              {fileName}
            </a>
            <button
              type="button"
              onClick={clear}
              aria-label="Remove file"
              className="shrink-0 text-muted transition hover:text-red-600"
            >
              ✕
            </button>
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-neutral-400">Image or PDF, up to 15 MB</p>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      <input type="hidden" name={name} value={url ?? ""} readOnly />
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) pick(e.target.files[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
