import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import {
  db,
  orders,
  orderItems,
  users,
  storefronts,
} from "@/lib/db"
import { auth } from "@/lib/auth"
import { verifyOrderAccessToken } from "@/lib/order-access"

type RouteContext = { params: Promise<{ orderId: string }> }

/**
 * GET /api/checkout/order/[orderId]/invoice
 *
 * Returns a printable HTML invoice. The browser handles Save-as-PDF via
 * Cmd+P / Ctrl+P. No PDF library dependency — keeps the bundle slim and
 * gives the user better quality output than the typical jsPDF/pdfkit
 * approach.
 *
 * Authorisation: must be either
 *   - logged in as the buyer or seller of this order, OR
 *   - presenting a valid `?t=<token>` access token (for guest buyers).
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orderId } = await params
    const tokenParam = req.nextUrl.searchParams.get("t")

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    // ─── Authorisation ──────────────────────────────────────────────────
    let authorised = false

    if (tokenParam) {
      const check = await verifyOrderAccessToken(tokenParam)
      if (check.ok && check.orderId === order.id) authorised = true
    }

    if (!authorised) {
      const session = await auth()
      const viewerId = session?.user?.id
      if (
        viewerId &&
        (viewerId === order.buyerId || viewerId === order.sellerId)
      ) {
        authorised = true
      }
    }

    if (!authorised) {
      return new NextResponse("Unauthorised", { status: 401 })
    }

    // ─── Gather invoice data ────────────────────────────────────────────
    const [items, sellerRow, storefrontRow] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
      db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, order.sellerId))
        .limit(1),
      db
        .select({
          storeName: storefronts.storeName,
          storeUrl: storefronts.storeUrl,
        })
        .from(storefronts)
        .where(eq(storefronts.userId, order.sellerId))
        .limit(1),
    ])

    const seller = sellerRow[0]
    const storefront = storefrontRow[0]

    const html = renderInvoice({
      order,
      items,
      sellerName: seller?.name ?? "GenZaic Seller",
      sellerEmail: seller?.email ?? "",
      storeName: storefront?.storeName ?? null,
      storeUrl: storefront?.storeUrl ?? null,
    })

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("GET /api/checkout/order/[orderId]/invoice error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// ────────────────────────────────────────────────────────────────────────
// HTML template
// ────────────────────────────────────────────────────────────────────────

interface RenderArgs {
  order: typeof orders.$inferSelect
  items: (typeof orderItems.$inferSelect)[]
  sellerName: string
  sellerEmail: string
  storeName: string | null
  storeUrl: string | null
}

const INR = (n: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n))

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  )

function renderInvoice({
  order,
  items,
  sellerName,
  sellerEmail,
  storeName,
  storeUrl,
}: RenderArgs): string {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const itemsRows = items
    .map((item) => {
      const rate = Number(item.price)
      const qty = item.quantity
      const taxable = rate * qty
      return `
        <tr>
          <td>${escapeHtml(item.productTitle)}${
            item.variantName
              ? `<div class="muted">${escapeHtml(item.variantName)}</div>`
              : ""
          }</td>
          <td class="num">${qty}</td>
          <td class="num">${INR(rate)}</td>
          <td class="num">${INR(taxable)}</td>
        </tr>
      `
    })
    .join("")

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(order.orderNumber)}</title>
<style>
  :root {
    --ink: #111827;
    --muted: #6b7280;
    --line: #e5e7eb;
    --accent: #6366f1;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
    color: var(--ink);
    background: #f3f4f6;
    margin: 0;
    padding: 32px 16px;
    /* Keep our brand colour, table headers, and totals divider visible
       when saving to PDF — by default Chrome / Edge strip backgrounds. */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    position: relative;
    max-width: 720px;
    margin: 0 auto;
    background: white;
    padding: 48px;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  .print-action {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--line);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 120ms;
  }
  .print-action:hover {
    background: #f9fafb;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 24px;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    /* Solid colour is the fallback for print (browsers strip backgrounds
       by default, which would otherwise turn the gradient text invisible
       because color is transparent). On screen, the gradient overrides
       it via background-clip: text. */
    color: var(--accent);
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .doc-title {
    text-align: right;
  }
  .doc-title h1 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.01em;
  }
  .doc-title .meta {
    margin-top: 6px;
    color: var(--muted);
    font-size: 13px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-bottom: 32px;
  }
  .party h3 {
    margin: 0 0 8px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 600;
  }
  .party .name {
    font-weight: 600;
    margin-bottom: 4px;
  }
  .party .line {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 14px;
  }
  thead th {
    text-align: left;
    background: #f9fafb;
    padding: 12px 12px;
    border-bottom: 1px solid var(--line);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 600;
  }
  thead th.num, tbody td.num { text-align: right; }
  tbody td {
    padding: 14px 12px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }
  tbody td .muted { color: var(--muted); font-size: 12px; margin-top: 2px; }
  .totals {
    margin-left: auto;
    width: 280px;
    font-size: 14px;
  }
  .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
  }
  .totals .row.grand {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 2px solid var(--ink);
    font-weight: 700;
    font-size: 16px;
  }
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
    text-align: center;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
  }
  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; border-radius: 0; padding: 24px; max-width: none; }
    .print-action { display: none; }
    /* Belt-and-braces fallback: even with print-color-adjust some
       browsers (Safari, older Firefox) still drop background-clip text.
       Disable the clip and paint the brand in a solid colour instead. */
    .brand {
      background: none;
      -webkit-text-fill-color: var(--accent);
      color: var(--accent);
    }
  }
  @page {
    margin: 12mm;
  }
</style>
</head>
<body>
  <div class="page">
    <button class="print-action" type="button" onclick="window.print()" aria-label="Save as PDF or print">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print
    </button>
    <div class="header">
      <div class="brand">GenZaic</div>
      <div class="doc-title">
        <h1>Tax Invoice</h1>
        <div class="meta">
          <div>Invoice # ${escapeHtml(order.orderNumber)}</div>
          <div>${date}</div>
        </div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>From</h3>
        <div class="name">${escapeHtml(storeName ?? sellerName)}</div>
        <div class="line">${escapeHtml(sellerName)}</div>
        <div class="line">${escapeHtml(sellerEmail)}</div>
        ${storeUrl ? `<div class="line">genzaic.com/store/${escapeHtml(storeUrl)}</div>` : ""}
      </div>
      <div class="party">
        <h3>Billed to</h3>
        <div class="name">${escapeHtml(order.buyerName)}</div>
        <div class="line">${escapeHtml(order.buyerEmail)}</div>
        ${order.buyerPhone ? `<div class="line">${escapeHtml(order.buyerPhone)}</div>` : ""}
        ${order.buyerGstin ? `<div class="line">GSTIN: ${escapeHtml(order.buyerGstin)}</div>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="row">
        <span>Subtotal</span>
        <span>${INR(order.subtotal)}</span>
      </div>
      <div class="row">
        <span>GST (18%)</span>
        <span>${INR(order.gstAmount)}</span>
      </div>
      ${
        Number(order.discountAmount) > 0
          ? `<div class="row"><span>Discount</span><span>− ${INR(order.discountAmount)}</span></div>`
          : ""
      }
      <div class="row grand">
        <span>Total</span>
        <span>${INR(order.totalAmount)}</span>
      </div>
    </div>

    <div class="footer">
      Thank you for your purchase.<br/>
      This is a system-generated invoice for digital goods. Tax applied at the
      prevailing rate at time of purchase.
    </div>
  </div>
</body>
</html>`
}
