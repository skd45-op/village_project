import Link from "next/link";
import { OmMark } from "@/components/brand/om-mark";
import { Container } from "@/components/ui/primitives";

const EXPLORE = [
  { href: "/occasions", label: "Occasions" },
  { href: "/updates", label: "Announcements" },
  { href: "/members", label: "Members" },
];

const INVOLVED = [
  { href: "/join", label: "Become a member" },
  { href: "/contact", label: "Contact admin" },
  { href: "/login", label: "Member sign in" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[color:var(--hairline)] bg-sand/60">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <OmMark />
              <div className="leading-tight">
                <p className="font-semibold">Kundapur</p>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted">
                  Village Connect
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">
              A shared space for our people, our celebrations, and our memories.
            </p>
          </div>

          <FooterCol title="Explore" links={EXPLORE} />
          <FooterCol title="Get involved" links={INVOLVED} />

          <div className="md:text-right">
            <p className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              Built for our village
            </p>
            <p className="mt-1 text-xs text-muted">Private member information stays private.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--hairline)] pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Kundapur Village Connect</span>
          <span>Made with care for our community</span>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow mb-3 text-muted">{title}</p>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-foreground/80 transition hover:text-terracotta">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
