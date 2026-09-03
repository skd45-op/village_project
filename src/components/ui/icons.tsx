// Small inline stroke icons for form fields, etc. Inherit currentColor.
type P = { className?: string };
const base = "h-4 w-4";

export function UserIcon({ className = base }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
export function PhoneIcon({ className = base }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6.6 10.8a13 13 0 0 0 6.6 6.6l2.2-2.2a1.3 1.3 0 0 1 1.3-.3 9 9 0 0 0 2.8.5A1.3 1.3 0 0 1 21 16.7V20a1.3 1.3 0 0 1-1.4 1.3A17 17 0 0 1 3.7 5.4 1.3 1.3 0 0 1 5 4h3.3a1.3 1.3 0 0 1 1.3 1.1 9 9 0 0 0 .5 2.8 1.3 1.3 0 0 1-.3 1.3z" />
    </svg>
  );
}
export function MailIcon({ className = base }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
export function LockIcon({ className = base }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
export function EyeIcon({ className = base }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function EyeOffIcon({ className = base }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-4 4.6M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.4-1" />
      <path d="M9.5 10a3 3 0 0 0 4.24 4.24" />
    </svg>
  );
}
