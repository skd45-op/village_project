"use client";

import { useState } from "react";
import { addMedia } from "@/lib/actions/occasions";
import { Field, Input, Select, ValidatedForm } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/submit-button";
import { PhotoUploader } from "./photo-uploader";

export function AddMediaForm({
  occasionId,
  currentYear,
  selectedYear,
}: {
  occasionId: string;
  currentYear: number;
  selectedYear: number;
}) {
  const [pickedYear, setPickedYear] = useState(selectedYear);
  const [type, setType] = useState<"photo" | "yt_link" | "live">("photo");

  const years: number[] = [];
  for (let y = currentYear + 1; y >= 1980; y--) years.push(y);

  const isPast = pickedYear < currentYear;
  // If the year switches to the past while "live" is selected, fall back to photo.
  const effectiveType = isPast && type === "live" ? "photo" : type;

  return (
    <div className="space-y-4">
      {/* Year + Type selectors */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Year" required>
          <Select
            name="year-display"
            value={pickedYear}
            onChange={(e) => setPickedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type" required>
          <Select
            value={effectiveType}
            onChange={(e) => setType(e.target.value as typeof type)}
          >
            <option value="photo">Photo (upload from device)</option>
            <option value="yt_link">YouTube video</option>
            {!isPast && <option value="live">Live stream</option>}
          </Select>
        </Field>
      </div>

      {/* Photo → drag-and-drop uploader */}
      {effectiveType === "photo" && (
        <PhotoUploader key={pickedYear} occasionId={occasionId} year={pickedYear} />
      )}

      {/* YouTube / Live → single URL */}
      {effectiveType !== "photo" && (
        <ValidatedForm action={addMedia} className="space-y-3">
          <input type="hidden" name="occasionId" value={occasionId} />
          <input type="hidden" name="year" value={pickedYear} />
          <input type="hidden" name="type" value={effectiveType} />
          <Field
            label={effectiveType === "live" ? "Live stream URL" : "YouTube video URL"}
            name="url"
            required
          >
            <Input
              name="url"
              type="url"
              required
              placeholder={
                effectiveType === "live"
                  ? "https://youtube.com/live/…"
                  : "https://youtube.com/watch?v=…"
              }
            />
          </Field>
          <SubmitButton pendingText="Adding…">Add {effectiveType === "live" ? "live stream" : "video"}</SubmitButton>
        </ValidatedForm>
      )}
    </div>
  );
}
