/** Toast strings — em-dash prefix, italic emphasis on the secondary clause. */
export const TOAST = {
  draftSaved:        "— Filed. Issue saved as draft.",
  published:         "— Sent to press. Live in the catalog.",
  publishedFallback: (hex: string) => `— Issue #${hex} is live.`,
  unpublished:       "— Pulled from press. Back in drafts.",
  saleReceived:      (hex: string, amount: string) => `— A reader picked up Issue #${hex}. +${amount}`,
  resetSent:         "— Letter sent. Reset link is in your inbox.",
  kycVerified:       "— Credentials accepted.",
  firstSale:         (hex: string) => `— Your first reader. Issue #${hex} just sold.`,
  genericError:      "— We lost the page. Trying again — give us a moment.",
  productCreated:    "— Created. Fill in the rest on the next screen.",
  productUpdated:    "— Filed. Catalog updated.",
  productDeleted:    "— Removed from the catalog.",
} as const

/** Empty-state strings */
export const EMPTY = {
  catalog: {
    headline: "An empty shelf — for now.",
    accentWord: "for now.",
    sub: "File piece #0001 and the catalog begins. Most creators start with one — a guide, a template, a thing they wished existed.",
    ctaLabel: "+ File the first piece",
  },
  receipts: {
    headline: "No receipts — yet.",
    accentWord: "yet.",
    sub: "Your first sale will start the ledger.",
    ctaLabel: null,
  },
  readerMail: {
    headline: "Quiet inbox.",
    accentWord: undefined,
    sub: "Reviews and reader notes appear here.",
    ctaLabel: null,
  },
  ledger: {
    headline: "Nothing on the ledger.",
    accentWord: "ledger.",
    sub: "Payouts appear here once you've earned them.",
    ctaLabel: null,
  },
} as const

/** Form validation messages. */
export const VALIDATION = {
  titleTooShort: "— Title needs at least 3 characters.",
  priceRequired: "— Price is required.",
  pricePositive: "— Price can't be negative.",
  externalUrlRequired: "— External URL is required for this delivery type.",
  externalUrlInvalid: "— That URL doesn't look right.",
  contactRequiredManual: "— Add at least one contact method (email, phone, or WhatsApp).",
  originalPriceTooLow: "— 'Was' should be higher than the current price.",
} as const
