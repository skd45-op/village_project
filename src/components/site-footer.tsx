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
    <footer className="mt-16 border-t border-[color:var(--hairline)] bg-sand/60 print:hidden">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <OmMark />
              <p className="font-semibold">Kundapur</p>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">
              A shared space for our people, our celebrations, and our memories.
            </p>
          </div>

          <FooterCol title="Explore" links={EXPLORE} />
          <FooterCol title="Get involved" links={INVOLVED} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-[color:var(--hairline)] pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Kundapur</span>
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
