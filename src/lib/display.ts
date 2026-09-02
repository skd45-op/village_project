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

// Brand gradient palettes for occasion cards / headers. Picked deterministically
// from a seed (occasion id or index) so a given occasion always looks the same.
const OCCASION_GRADIENTS = [
  "from-[#c8663a] via-[#b34a2f] to-[#8f3a26]", // terracotta
  "from-[#1f6d57] via-[#155844] to-[#0d3a2e]", // teal
  "from-[#6d3a63] via-[#4a2c47] to-[#341f33]", // plum
  "from-[#b07a2e] via-[#8f5f22] to-[#6b471a]", // gold-brown
  "from-[#3a5a8f] via-[#2c477a] to-[#1f3560]", // indigo
];

export function occasionGradient(seed: string | number): string {
  let n = 0;
  if (typeof seed === "number") n = seed;
  else for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % 997;
  return OCCASION_GRADIENTS[Math.abs(n) % OCCASION_GRADIENTS.length];
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
