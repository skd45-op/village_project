import { clearPreviewMode } from "@/lib/actions/auth";

export function PreviewBanner({ previewAs }: { previewAs: "guest" | "member" }) {
  const label = previewAs === "guest" ? "Guest" : "Member";
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950">
      <span>
        👁 Previewing as <strong>{label}</strong> — this is what a {label.toLowerCase()} sees.
      </span>
      <form action={clearPreviewMode}>
        <button
          type="submit"
          className="rounded-full bg-amber-950/15 px-3 py-1 text-xs font-semibold hover:bg-amber-950/25 transition"
        >
          Exit preview
        </button>
      </form>
    </div>
  );
}
