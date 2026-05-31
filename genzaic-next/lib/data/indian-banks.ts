/**
 * Canonical list of Indian banks used in the KYC bank-account picker.
 * Sourced from RBI's list of scheduled commercial banks, payment banks,
 * and small finance banks. Names match Razorpay's IFSC lookup output
 * after a case-insensitive normalisation (see `findBankByName`).
 */
export const INDIAN_BANKS: readonly string[] = [
  // ── Public sector ──────────────────────────────────────────────────────────
  "State Bank of India",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "Indian Bank",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",

  // ── Private sector ─────────────────────────────────────────────────────────
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "IDBI Bank",
  "IDFC FIRST Bank",
  "Federal Bank",
  "South Indian Bank",
  "RBL Bank",
  "Bandhan Bank",
  "City Union Bank",
  "DCB Bank",
  "Jammu & Kashmir Bank",
  "Karnataka Bank",
  "Karur Vysya Bank",
  "Nainital Bank",
  "Tamilnad Mercantile Bank",
  "Dhanlaxmi Bank",
  "CSB Bank",

  // ── Foreign ────────────────────────────────────────────────────────────────
  "Citibank",
  "HSBC Bank",
  "Standard Chartered Bank",
  "Deutsche Bank",
  "DBS Bank India",
  "Barclays Bank",

  // ── Small finance ──────────────────────────────────────────────────────────
  "AU Small Finance Bank",
  "Equitas Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "Jana Small Finance Bank",
  "Suryoday Small Finance Bank",
  "Capital Small Finance Bank",
  "ESAF Small Finance Bank",
  "Fincare Small Finance Bank",
  "North East Small Finance Bank",
  "Shivalik Small Finance Bank",
  "Unity Small Finance Bank",

  // ── Payment banks ──────────────────────────────────────────────────────────
  "Paytm Payments Bank",
  "Airtel Payments Bank",
  "India Post Payments Bank",
  "Fino Payments Bank",
  "Jio Payments Bank",
  "NSDL Payments Bank",
]

const NORMALISE = (s: string) =>
  s
    .toLowerCase()
    .replace(/\bltd\.?\b|\blimited\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim()

/**
 * Find a bank in `INDIAN_BANKS` that matches `raw` (case- and punctuation-
 * insensitive). Used to canonicalise the Razorpay IFSC lookup result so a
 * response of "STATE BANK OF INDIA" maps cleanly to "State Bank of India".
 */
export function findBankByName(raw: string): string | null {
  if (!raw) return null
  const needle = NORMALISE(raw)
  if (!needle) return null
  return (
    INDIAN_BANKS.find((b) => NORMALISE(b) === needle) ??
    INDIAN_BANKS.find((b) => NORMALISE(b).includes(needle) || needle.includes(NORMALISE(b))) ??
    null
  )
}
