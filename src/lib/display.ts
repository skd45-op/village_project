import type { SessionStatus, RequestStatus } from "@/generated/prisma/enums";

type Tone = "neutral" | "green" | "amber" | "red" | "blue";

export function sessionStatusTone(status: SessionStatus): Tone {
  return status === "ongoing" ? "green" : status === "upcoming" ? "blue" : "neutral";
}

export function requestStatusTone(status: RequestStatus): Tone {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "needs_info":
      return "amber";
    default:
      return "blue";
  }
}

// Convert a YouTube watch/live/short URL to an embeddable URL. Returns null if
// it doesn't look like a YouTube link.
export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/watch")) id = u.searchParams.get("v") ?? "";
      else if (u.pathname.startsWith("/live/")) id = u.pathname.split("/")[2] ?? "";
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2] ?? "";
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
