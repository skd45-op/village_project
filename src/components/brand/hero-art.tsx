import { cn } from "@/lib/utils";

// The hero illustration — a warm sky, a glowing sun and layered mountain
// ranges, drawn entirely with SVG gradients (no image assets, theme-agnostic).
export function HeroArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-2xl",
        className,
      )}
    >
      <svg
        viewBox="0 0 800 600"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="A stylised sunset over village hills"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b34a2f" />
            <stop offset="45%" stopColor="#c8663a" />
            <stop offset="100%" stopColor="#d98a44" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe9a8" />
            <stop offset="35%" stopColor="#ffd36b" />
            <stop offset="70%" stopColor="#f7b733" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f7b733" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunCore" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fff2c4" />
            <stop offset="60%" stopColor="#ffd15c" />
            <stop offset="100%" stopColor="#f6bd3b" />
          </radialGradient>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a3350" />
            <stop offset="100%" stopColor="#5c2542" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a2340" />
            <stop offset="100%" stopColor="#341a30" />
          </linearGradient>
          <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123a2f" />
            <stop offset="100%" stopColor="#0c2a22" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="800" height="600" fill="url(#sky)" />

        {/* Faint concentric rings */}
        <g stroke="#ffffff" strokeOpacity="0.08" fill="none">
          <circle cx="560" cy="250" r="120" />
          <circle cx="560" cy="250" r="180" />
          <circle cx="560" cy="250" r="250" />
        </g>

        {/* Stars / distant planets — twinkling */}
        <circle className="anim-twinkle" style={{ animationDelay: "0s" }} cx="180" cy="150" r="4" fill="#ffe9a8" />
        <circle className="anim-twinkle" style={{ animationDelay: "1.2s" }} cx="300" cy="120" r="3" fill="#ffe9a8" />
        <circle className="anim-twinkle" style={{ animationDelay: "2.1s" }} cx="420" cy="170" r="3.5" fill="#ffe9a8" />

        {/* Sun — glow pulses */}
        <circle className="anim-sun" cx="560" cy="250" r="200" fill="url(#sunGlow)" />
        <circle cx="560" cy="250" r="92" fill="url(#sunCore)" />

        {/* Mountain ranges — parallax drift at different speeds */}
        <path className="anim-drift-slow" d="M0 470 L150 380 L300 460 L470 360 L620 450 L800 380 L800 600 L0 600 Z" fill="url(#hill1)" />
        <path className="anim-drift-fast" d="M0 520 L180 440 L360 510 L540 430 L720 500 L800 470 L800 600 L0 600 Z" fill="url(#hill2)" opacity="0.96" />
        <path className="anim-drift-slow" style={{ animationDelay: "2s" }} d="M0 560 L220 505 L430 555 L640 505 L800 545 L800 600 L0 600 Z" fill="url(#hill3)" />
      </svg>
    </div>
  );
}
