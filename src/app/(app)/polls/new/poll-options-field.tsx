"use client";

import { useState } from "react";
import { Input } from "@/components/ui/primitives";

// Renders one text input per poll option instead of a "one per line" textarea.
// Each input shares name="options" so the server action can read them all via
// form.getAll("options"). Starts with 2 (the minimum); "+ Add option" appends
// more, and a "✕" lets you remove any option once there are more than 2.
export function PollOptionsField() {
  const [options, setOptions] = useState<string[]>(["", ""]);

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            name="options"
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            required
            className="flex-1"
          />
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(i)}
              aria-label={`Remove option ${i + 1}`}
              className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-black/[0.05] hover:text-red-600 dark:hover:bg-white/10"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addOption}
        className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        <span aria-hidden>+</span> Add option
      </button>
    </div>
  );
}
