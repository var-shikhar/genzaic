import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Privacy Policy | GenZaic",
  description: "Learn how GenZaic collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-xl text-foreground">GenZaic</span>
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
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Data, Your Trust</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Privacy Policy
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
                GenZaic (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the GenZaic platform (genzaic.com). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully. By using GenZaic, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p><strong className="text-foreground">Personal Information:</strong> When you register, we collect your name, email address, phone number, and payment details (UPI ID, bank account information for payouts).</p>
                <p><strong className="text-foreground">KYC Information:</strong> For creators, we collect identity documents (PAN card, Aadhaar, GSTIN) as required by Indian regulations for payment processing and tax compliance.</p>
                <p><strong className="text-foreground">Transaction Data:</strong> We record details of purchases, sales, downloads, and payment transactions processed through our platform.</p>
                <p><strong className="text-foreground">Usage Data:</strong> We automatically collect information about how you interact with our platform, including IP address, browser type, pages visited, time spent, and device information.</p>
                <p><strong className="text-foreground">Cookies & Tracking:</strong> We use cookies and similar technologies to maintain your session, remember preferences, and analyze platform usage.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                <li>To create and manage your account and storefront</li>
                <li>To process transactions, payouts, and generate GST invoices</li>
                <li>To verify your identity (KYC) as required by Indian law</li>
                <li>To send transactional emails (order confirmations, payout notifications)</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To improve and personalize your experience on the platform</li>
                <li>To detect and prevent fraud, abuse, or unauthorized access</li>
                <li>To comply with legal obligations and regulatory requirements</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Information Sharing & Disclosure</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We do <strong className="text-foreground">not</strong> sell your personal data to third parties. We may share information with:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Payment Processors:</strong> Razorpay and banking partners to process payments and payouts</li>
                  <li><strong className="text-foreground">Service Providers:</strong> Cloud hosting (for file storage and delivery), email services, and analytics tools that help us operate the platform</li>
                  <li><strong className="text-foreground">Legal Authorities:</strong> When required by law, court order, or government regulation</li>
                  <li><strong className="text-foreground">Buyers & Sellers:</strong> Limited transaction-related information (e.g., buyer name on order details visible to sellers)</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Data Storage & Security</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Your data is stored on secure servers. We use industry-standard security measures including SSL/TLS encryption for data in transit, encrypted storage for sensitive information, and secure access controls.</p>
                <p>While we strive to protect your personal information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security but are committed to implementing best practices.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Under applicable Indian data protection laws, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access and review the personal data we hold about you</li>
                  <li>Request correction of inaccurate or incomplete data</li>
                  <li>Request deletion of your account and associated data (subject to legal retention requirements)</li>
                  <li>Withdraw consent for optional data processing (e.g., marketing emails)</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>
                <p>To exercise any of these rights, please contact us at <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a>.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We use essential cookies to keep you logged in and maintain your session. We may also use analytics cookies to understand how users interact with GenZaic. You can control cookie preferences through your browser settings, but disabling essential cookies may affect platform functionality.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform may contain links to third-party websites or services (e.g., creator storefronts, external payment pages). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                GenZaic is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of GenZaic after changes constitutes acceptance of the updated policy. We will notify registered users via email for significant changes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a>.
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
