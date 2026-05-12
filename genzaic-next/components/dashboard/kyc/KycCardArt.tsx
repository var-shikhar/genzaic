/**
 * Low-opacity SVG illustrations rendered behind each credential card in the
 * KYC side panel. These are *stylized* document silhouettes — not real
 * government emblems or bank logos — so we never expose copyrighted marks
 * or imply official endorsement. Sized to peek slightly past the edge of
 * each parent card so the card-behind-card feel reads even when clipped.
 */

import { cn } from "@/lib/utils"

interface BgArtProps {
  className?: string
}

// ─── PAN card silhouette ──────────────────────────────────────────────────

export function PanCardArt({ className }: BgArtProps) {
  return (
    <svg
      viewBox="0 0 220 138"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(
        "absolute -right-5 -bottom-4 w-[170px] h-auto rotate-[-7deg]",
        className,
      )}
    >
      {/* Card body */}
      <rect x="2" y="2" width="216" height="134" rx="11" />
      {/* Header strip */}
      <line x1="14" y1="14" x2="80" y2="14" />
      {/* Photo placeholder */}
      <rect x="14" y="26" width="42" height="52" rx="2" />
      <path d="M35 55 q-8 -2 -14 8 v9 h28 v-9 q-6 -10 -14 -8 z" />
      <circle cx="35" cy="44" r="6" />
      {/* Name / DOB lines */}
      <line x1="68" y1="32" x2="190" y2="32" />
      <line x1="68" y1="42" x2="160" y2="42" />
      <line x1="68" y1="56" x2="190" y2="56" />
      <line x1="68" y1="66" x2="150" y2="66" />
      {/* PAN number bar */}
      <rect x="14" y="92" width="148" height="10" rx="2" />
      {/* Signature line */}
      <line x1="14" y1="118" x2="100" y2="118" />
      {/* Watermark seal */}
      <circle cx="190" cy="118" r="14" />
      <circle cx="190" cy="118" r="9" />
    </svg>
  )
}

// ─── Aadhaar card silhouette ──────────────────────────────────────────────

export function AadhaarCardArt({ className }: BgArtProps) {
  return (
    <svg
      viewBox="0 0 220 138"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(
        "absolute -left-4 -bottom-4 w-[175px] h-auto rotate-[6deg]",
        className,
      )}
    >
      {/* Card body */}
      <rect x="2" y="2" width="216" height="134" rx="11" />
      {/* Top header band */}
      <line x1="2" y1="22" x2="218" y2="22" />
      <line x1="14" y1="12" x2="80" y2="12" />
      {/* Photo */}
      <rect x="14" y="32" width="44" height="56" rx="2" />
      <circle cx="36" cy="50" r="7" />
      <path d="M22 84 q14 -16 28 0" />
      {/* Name + dob/gender lines */}
      <line x1="70" y1="36" x2="200" y2="36" />
      <line x1="70" y1="46" x2="170" y2="46" />
      <line x1="70" y1="60" x2="140" y2="60" />
      <line x1="70" y1="70" x2="130" y2="70" />
      {/* Aadhaar 12-digit row */}
      <line x1="14" y1="104" x2="50" y2="104" />
      <line x1="58" y1="104" x2="94" y2="104" />
      <line x1="102" y1="104" x2="138" y2="104" />
      {/* QR placeholder */}
      <rect x="160" y="92" width="44" height="40" rx="2" />
      <rect x="166" y="98" width="8" height="8" />
      <rect x="190" y="98" width="8" height="8" />
      <rect x="166" y="120" width="8" height="8" />
      <rect x="178" y="110" width="4" height="4" />
      <rect x="186" y="116" width="4" height="4" />
    </svg>
  )
}

// ─── Bank / debit card silhouette ─────────────────────────────────────────

export function BankCardArt({ className }: BgArtProps) {
  return (
    <svg
      viewBox="0 0 220 138"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(
        "absolute -right-6 -top-3 w-[180px] h-auto rotate-[8deg]",
        className,
      )}
    >
      {/* Card body */}
      <rect x="2" y="2" width="216" height="134" rx="13" />
      {/* Bank logo placeholder */}
      <rect x="14" y="14" width="56" height="14" rx="2" />
      {/* EMV chip */}
      <rect x="14" y="42" width="32" height="24" rx="3" />
      <line x1="14" y1="50" x2="46" y2="50" />
      <line x1="14" y1="58" x2="46" y2="58" />
      <line x1="22" y1="42" x2="22" y2="66" />
      <line x1="30" y1="42" x2="30" y2="66" />
      <line x1="38" y1="42" x2="38" y2="66" />
      {/* Contactless wave */}
      <path d="M62 44 q6 10 0 20" />
      <path d="M68 40 q10 14 0 28" />
      <path d="M74 36 q14 18 0 36" />
      {/* Card number — four groups of 4 */}
      <line x1="14" y1="86" x2="46" y2="86" />
      <line x1="56" y1="86" x2="88" y2="86" />
      <line x1="98" y1="86" x2="130" y2="86" />
      <line x1="140" y1="86" x2="172" y2="86" />
      {/* Holder + expiry */}
      <line x1="14" y1="110" x2="80" y2="110" />
      <line x1="14" y1="120" x2="120" y2="120" />
      <line x1="160" y1="110" x2="200" y2="110" />
      <line x1="160" y1="120" x2="200" y2="120" />
    </svg>
  )
}

// ─── UPI / phone silhouette ───────────────────────────────────────────────

export function UpiArt({ className }: BgArtProps) {
  return (
    <svg
      viewBox="0 0 160 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(
        "absolute -right-4 -top-2 w-[110px] h-auto rotate-[-5deg]",
        className,
      )}
    >
      {/* Phone outline */}
      <rect x="40" y="6" width="46" height="74" rx="6" />
      <rect x="46" y="14" width="34" height="50" rx="2" />
      <circle cx="63" cy="74" r="2" />
      {/* QR on phone screen */}
      <rect x="50" y="18" width="10" height="10" />
      <rect x="66" y="18" width="10" height="10" />
      <rect x="50" y="34" width="10" height="10" />
      <rect x="66" y="34" width="4" height="4" />
      <rect x="72" y="40" width="4" height="4" />
      <rect x="66" y="46" width="4" height="4" />
      <line x1="50" y1="56" x2="76" y2="56" />
      <line x1="50" y1="60" x2="68" y2="60" />
      {/* Outgoing rupee burst */}
      <path d="M100 30 q12 0 18 -12" />
      <path d="M104 38 q14 0 22 -14" />
      <path d="M108 46 q16 0 26 -16" />
      <text
        x="124"
        y="14"
        fontSize="10"
        stroke="none"
        fill="currentColor"
        fontFamily="serif"
      >
        ₹
      </text>
    </svg>
  )
}
