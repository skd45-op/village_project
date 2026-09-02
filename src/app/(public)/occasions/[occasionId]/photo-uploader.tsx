"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addPhotos } from "@/lib/actions/occasions";
import { MEDIA_BUCKET } from "@/lib/constants";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per photo

type Status = "ready" | "uploading" | "done" | "failed";

type Picked = {
  id: string;
  file: File;
  preview: string;
  status: Status;
};

export function PhotoUploader({
  occasionId,
  year,
}: {
  occasionId: string;
  year: number;
}) {
  const [items, setItems] = useState<Picked[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | File[]) {
    setError(null);
    const incoming = Array.from(fileList);
    const valid: Picked[] = [];
    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" is larger than 15 MB.`);
        continue;
      }
      valid.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "ready",
      });
    }
    if (valid.length) setItems((prev) => [...prev, ...valid]);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleUpload() {
    if (items.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const item of items) {
      if (item.status === "done") {
        continue;
      }
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" } : p)));

      const ext = item.file.name.split(".").pop() || "jpg";
      const path = `${occasionId}/${year}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, item.file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "failed" } : p)));
        setError(upErr.message);
        continue;
      }

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: "done" } : p)));
    }

    if (uploadedUrls.length === 0) {
      setBusy(false);
      if (!error) setError("Upload failed. Please try again.");
      return;
    }

    // Persist the records — this redirects to ?year on success.
    try {
      await addPhotos(occasionId, year, uploadedUrls);
    } catch (e) {
      // redirect() throws a special error that Next handles — only real errors land here.
      const msg = e instanceof Error ? e.message : "";
      if (msg && !msg.includes("NEXT_REDIRECT")) {
        setError(msg);
        setBusy(false);
      }
    }
  }

  const pendingCount = items.filter((i) => i.status !== "done").length;

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
            : "border-neutral-300 hover:border-brand-400 dark:border-neutral-700"
        }`}
      >
        <span className="text-3xl">📁</span>
        <p className="text-sm font-medium">
          Drag &amp; drop photos here, or <span className="text-brand-600">click to browse</span>
        </p>
        <p className="text-xs text-neutral-400">JP, PNG, up to 15 MB each · multiple allowed</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Thumbnails */}
      {items.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="aspect-square overflow-hidden rounded-lg border border-black/10 bg-neutral-100 dark:bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt="" className="h-full w-full object-cover" />
                </div>
                <StatusChip status={item.status} />
                {item.status === "ready" && !busy && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute right-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={busy || pendingCount === 0}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Uploading…" : `Upload ${pendingCount} photo${pendingCount === 1 ? "" : "s"}`}
          </button>
        </>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: Status }) {
  if (status === "ready") return null;
  const map: Record<Exclude<Status, "ready">, { label: string; cls: string }> = {
    uploading: { label: "Uploading…", cls: "bg-amber-500" },
    done: { label: "Uploaded ✓", cls: "bg-brand-600" },
    failed: { label: "Failed ✕", cls: "bg-red-600" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white ${cls}`}>
      {label}
    </span>
  );
}
