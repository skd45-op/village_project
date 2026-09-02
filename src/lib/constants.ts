import type { Module } from "@/generated/prisma/enums";

// Supabase Storage bucket that holds uploaded occasion photos.
export const MEDIA_BUCKET = "occasion-media";

// Supabase Storage bucket for profile photos (avatars). Uploads are allowed for
// anonymous users too, because the join/signup form runs before authentication.
export const AVATAR_BUCKET = "avatars";

// Modules an Admin can be granted (doc §2.2).
export const MODULES: { value: Module; label: string; description: string }[] = [
  { value: "media", label: "Media", description: "Add photos / YouTube links / mark a session live" },
  { value: "budget", label: "Budget", description: "Add income / expense entries with proof" },
  { value: "members", label: "Members", description: "Review and approve membership requests" },
  { value: "occasions", label: "Occasions", description: "Create occasions and yearly sessions" },
  { value: "polls", label: "Polls", description: "Create polls" },
  { value: "cricket", label: "Cricket", description: "(Phase 2) Players, teams, live scoring" },
];

export const RELATION_OPTIONS = ["Native", "Moved out", "Relative", "Other"] as const;

export const BUDGET_CATEGORIES = [
  "Donation",
  "Sponsorship",
  "Carry forward",
  "Decoration",
  "Prasad",
  "Priest",
  "Electricity",
  "Sound / Light",
  "Food",
  "Misc",
] as const;
