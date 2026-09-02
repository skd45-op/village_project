"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Pointer-driven 3D tilt. Wraps children; tilts toward the cursor and springs
// back on leave. No-ops under prefers-reduced-motion (CSS disables the transition
// and we skip transforms).
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = innerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg) scale(1.02)`;
  }

  function onLeave() {
    const el = innerRef.current;
    if (el) el.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
  }

  return (
    <div className={cn("tilt", className)} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={innerRef} className="tilt-inner h-full">
        {children}
      </div>
    </div>
  );
}
