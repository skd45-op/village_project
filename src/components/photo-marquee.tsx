import Image from "next/image";

// Continuously auto-scrolling band of recent photos. Two copies of the strip sit
// side by side and the track translates -50%, so the loop is seamless. Pauses on
// hover; stops entirely under prefers-reduced-motion (globals.css).
export function PhotoMarquee({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  const strip = [...urls, ...urls]; // duplicate for a seamless loop

  return (
    <div className="marquee-pause relative overflow-hidden py-2">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[color:var(--background)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[color:var(--background)] to-transparent" />

      <div className="flex w-max animate-marquee gap-4">
        {strip.map((url, i) => (
          <div
            key={i}
            className="h-44 w-64 shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] shadow-sm"
          >
            <Image
              src={url}
              alt=""
              width={256}
              height={176}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
