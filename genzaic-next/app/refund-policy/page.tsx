import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import Image from "next/image"
import logoFull from "../../public/logo.png"
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
            <Image src={logoFull} alt="Genzaic" width={100} height={20} />
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
            Refund Policy
          </h1>
          <p className="text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-10">
            <div className="bg-card rounded-2xl border border-border p-8">
              <p className="text-muted-foreground leading-relaxed">
                At GenZaic, we want every purchase to be a positive experience. Since we deal exclusively in digital products, our refund policy is designed to be fair to both buyers and creators. Please read this policy carefully before making a purchase.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Nature of Digital Products</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>All products sold on GenZaic are digital goods (e.g., PDFs, templates, code, designs, e-books). Once a digital product is purchased and the download link is delivered, the transaction is generally considered complete as the product has been delivered.</p>
                <p>Due to the nature of digital products, they cannot be &quot;returned&quot; in the traditional sense. Therefore, all sales are considered <strong className="text-foreground">final</strong> unless the conditions below apply.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. When Refunds Are Eligible</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>You may request a refund within <strong className="text-foreground">7 days</strong> of purchase under the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Product not delivered:</strong> You did not receive the download link or the file after a successful payment</li>
                  <li><strong className="text-foreground">Corrupted or non-functional file:</strong> The downloaded file is corrupted, damaged, or cannot be opened in the format described</li>
                  <li><strong className="text-foreground">Significantly not as described:</strong> The product is materially different from what was advertised in the product listing (description, preview, or screenshots)</li>
                  <li><strong className="text-foreground">Duplicate purchase:</strong> You were accidentally charged twice for the same product</li>
                  <li><strong className="text-foreground">Unauthorized transaction:</strong> The purchase was made without your authorization</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. When Refunds Are NOT Eligible</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Refunds will not be granted in the following cases:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You simply changed your mind after purchasing</li>
                  <li>You found the product available elsewhere for free or at a lower price</li>
                  <li>You lack the technical knowledge or software to use the product (unless specifically misrepresented)</li>
                  <li>You have already downloaded and used the product</li>
                  <li>The refund request is made after 7 days from the date of purchase</li>
                  <li>You violated the product&apos;s license terms (e.g., redistributed the product)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. How to Request a Refund</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To request a refund, please follow these steps:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Email us at <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a> within 7 days of your purchase</li>
                  <li>Include your order ID, registered email address, and a clear description of the issue</li>
                  <li>Attach screenshots or evidence supporting your claim (if applicable)</li>
                </ol>
                <p>Our support team will review your request and respond within <strong className="text-foreground">3-5 business days</strong>.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Refund Process</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If your refund is approved:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The refund will be processed to your original payment method (UPI, card, wallet, or net banking)</li>
                  <li>Refunds typically take <strong className="text-foreground">5-10 business days</strong> to reflect in your account, depending on your bank or payment provider</li>
                  <li>You will receive an email confirmation once the refund has been initiated</li>
                  <li>Your access to the product&apos;s download link will be revoked upon refund</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Cancellation of Orders</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Since digital products are delivered instantly upon payment, orders cannot be cancelled after the transaction is completed. If you experience a payment failure or pending transaction, please wait for up to 30 minutes before contacting support, as the payment may still be processing.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Creator Payouts & Refunds</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>When a refund is issued to a buyer, the corresponding amount (minus any non-refundable payment processing fees) will be deducted from the creator&apos;s pending or future payouts. Creators are notified via email when a refund is processed against one of their products.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Disputes</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If you are not satisfied with the outcome of your refund request, you may escalate the matter by replying to the support email thread. We aim to resolve all disputes fairly and amicably.</p>
                <p>For unresolved disputes, you may contact your bank or payment provider to initiate a chargeback. However, we encourage resolving issues through our support team first, as chargebacks may result in account restrictions.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For any questions about this Refund Policy or to submit a refund request, please contact us at <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a>.
              </p>
            </section>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
