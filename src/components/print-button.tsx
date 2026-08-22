"use client";

import { buttonClass } from "@/components/ui/button";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className={buttonClass("primary", "sm")}>
      Print / Save as PDF
    </button>
  );
}
