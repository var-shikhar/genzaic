import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Refund Policy | GenZaic",
  description: "Understand GenZaic's refund and cancellation policy for digital product purchases.",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={100} height={20} />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/40 to-background" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="container mx-auto relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Fair & Transparent</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Refund and Cancellation Policy
          </h1>
          <p className="text-muted-foreground">Last updated: 11 June 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-10">
            <div className="bg-card rounded-2xl border border-border p-8">
              <p className="text-muted-foreground leading-relaxed">
                At GenZaic, we aim to maintain a fair and trustworthy marketplace for both buyers and sellers. Since most products available on the platform are digital products that can be accessed or downloaded instantly, refunds and cancellations are handled differently from physical goods.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Please read this Refund and Cancellation Policy carefully before making a purchase.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Platform Role</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic operates as a technology platform that enables independent sellers to offer digital products and services to buyers.</p>
                <p>Unless expressly stated otherwise, GenZaic is not the creator, owner, or seller of products listed by independent sellers. While we may assist in resolving disputes, refund decisions may depend on the circumstances of each transaction and the applicable platform policies.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. General Refund Policy</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Due to the nature of digital products, purchases are generally considered final once the purchased content has been successfully delivered or accessed.</p>
                <p>However, refunds may be granted in specific situations described in this policy or where required by applicable law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Eligible Refund Scenarios</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>A buyer may be eligible for a refund in situations including, but not limited to:</p>
                <div className="space-y-3">
                  <div>
                    <p><strong className="text-foreground">Product Not Delivered</strong></p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Payment was successfully completed.</li>
                      <li>No download link, access credentials, or product access was provided.</li>
                      <li>The seller failed to deliver the purchased product.</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Duplicate Payment</strong></p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>The buyer was charged more than once for the same purchase due to a technical or payment processing issue.</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Corrupted or Inaccessible Product</strong></p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>The delivered file is corrupted or unusable.</li>
                      <li>The product cannot reasonably be accessed despite following provided instructions.</li>
                      <li>The seller is unable to provide a working replacement within a reasonable time.</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Material Misrepresentation</strong></p>
                    <p className="mt-1">The delivered product is substantially different from its listing or description, including situations where:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>An incorrect file was delivered.</li>
                      <li>Significant promised content is missing.</li>
                      <li>A materially different product was provided.</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Unauthorized or Fraudulent Transactions</strong></p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Payments were made without proper authorization.</li>
                      <li>Fraudulent activity is confirmed after investigation.</li>
                      <li>The transaction resulted from unauthorized account access.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Situations Generally Not Eligible for Refund</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Refunds will generally not be granted where:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The buyer changed their mind after purchase.</li>
                  <li>The buyer no longer requires the product.</li>
                  <li>The wrong product was selected by the buyer.</li>
                  <li>The buyer failed to review the product description before purchasing.</li>
                  <li>The buyer lacks the technical knowledge or software required to use the product.</li>
                  <li>The buyer dislikes the product&apos;s style, presentation, or educational approach.</li>
                  <li>The product was successfully delivered and accessed without any material defect or misrepresentation.</li>
                  <li>The request is inconsistent with this policy or appears abusive or fraudulent.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Digital Product Delivery</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>For the purposes of this policy, a digital product is considered delivered when the buyer is successfully provided with:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>A download link;</li>
                  <li>Access credentials;</li>
                  <li>A license key;</li>
                  <li>Membership access; or</li>
                  <li>Any other reasonable method of accessing the purchased content.</li>
                </ul>
                <p>Because digital products can be copied and retained permanently, refunds may be restricted after successful delivery or access.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Seller-Specific Refund Policies</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Some sellers may publish additional refund terms for their products.</p>
                <p>Where such policies exist, they may apply alongside this Refund and Cancellation Policy, provided they do not conflict with applicable law or mandatory GenZaic platform rules.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. How to Request a Refund</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If you believe you qualify for a refund:</p>
                <div className="space-y-3">
                  <div>
                    <p><strong className="text-foreground">Step 1</strong></p>
                    <p className="mt-1">Contact the seller, where appropriate, and attempt to resolve the issue.</p>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Step 2</strong></p>
                    <p className="mt-1">If the issue remains unresolved, contact GenZaic Support.</p>
                  </div>
                  <div>
                    <p><strong className="text-foreground">Step 3</strong></p>
                    <p className="mt-1">Provide supporting information, including:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Order ID</li>
                      <li>Email address used for purchase</li>
                      <li>Description of the issue</li>
                      <li>Screenshots or relevant evidence, where available</li>
                    </ul>
                  </div>
                </div>
                <p>Incomplete or inaccurate requests may delay the review process.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Review Process</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Refund requests are generally reviewed within <strong className="text-foreground">3 to 7 business days</strong>.</p>
                <p>Additional documentation or clarification may be requested where necessary.</p>
                <p>Cases involving fraud, payment disputes, or technical investigations may require additional review time.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Approved Refunds</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Where a refund is approved:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Refunds will generally be issued through the original payment method used for the transaction.</li>
                  <li>Processing times depend on banks and payment providers.</li>
                  <li>Funds may take approximately <strong className="text-foreground">5 to 15 business days</strong> to appear in the buyer&apos;s account.</li>
                  <li>Certain payment processing fees or third-party charges may not be refundable where permitted by applicable law.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Chargebacks and Payment Disputes</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Before initiating a chargeback or payment dispute with a bank or payment provider, buyers are encouraged to contact the seller or GenZaic Support to seek resolution.</p>
                <p>Where a chargeback is initiated:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Seller payouts may be temporarily withheld.</li>
                  <li>Product access may be suspended where appropriate.</li>
                  <li>Additional verification or evidence may be requested from the parties involved.</li>
                </ul>
                <p>Fraudulent or abusive chargebacks may result in account restrictions, suspension, or other actions permitted under applicable law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Seller Responsibilities</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Sellers are expected to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Deliver products substantially as described.</li>
                  <li>Respond to legitimate buyer concerns in a timely manner.</li>
                  <li>Cooperate with refund investigations.</li>
                  <li>Avoid misleading descriptions or deceptive practices.</li>
                </ul>
                <p>Repeated violations or abusive conduct may result in listing removal, account restrictions, payout delays, or suspension.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Platform Discretion</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic reserves the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Investigate refund requests and disputes.</li>
                  <li>Request additional information from buyers or sellers.</li>
                  <li>Deny refund requests that do not satisfy this policy.</li>
                  <li>Reverse fraudulent transactions where legally permitted.</li>
                  <li>Take appropriate action against abuse or misuse of the platform.</li>
                </ul>
                <p>Nothing in this section limits rights that users may have under applicable law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Changes to This Policy</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may update this Refund and Cancellation Policy from time to time.</p>
                <p>The latest version will always be published on the platform with an updated &quot;Last Updated&quot; date. Continued use of GenZaic following such updates constitutes acceptance of the revised policy.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">14. Contact Us</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>For refund-related questions or assistance, please contact:</p>
                <p>
                  <strong className="text-foreground">GenZaic</strong><br />
                  Support Email: <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a><br />
                  Business Email: <a href="mailto:business@genzaic.com" className="text-primary hover:underline">business@genzaic.com</a><br />
                  Website: <a href="https://www.genzaic.com" className="text-primary hover:underline">www.genzaic.com</a><br />
                  Address: Moradabad, Uttar Pradesh, India
                </p>
                <p>By purchasing through GenZaic, you acknowledge that you have read, understood, and agreed to this Refund and Cancellation Policy.</p>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
