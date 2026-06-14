import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Disclaimer | GenZaic",
  description: "Read the GenZaic disclaimer covering our platform role, seller content, AI features, payments, and limitation of liability.",
}

export default function DisclaimerPage() {
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
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Please Read Carefully</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Disclaimer
          </h1>
          <p className="text-muted-foreground">Last Updated: 11 June 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-10">
            <div className="bg-card rounded-2xl border border-border p-8">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to GenZaic. The information, services, content, products, and features available through GenZaic are provided for general informational and commercial purposes only. By accessing or using our platform, you acknowledge and agree to this Disclaimer.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Platform Role</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic is a technology platform that enables creators, educators, freelancers, businesses, and digital sellers to create storefronts, sell digital products and services, receive payments, generate invoices, and manage digital commerce activities.</p>
                <p>Unless expressly stated otherwise, GenZaic acts solely as a marketplace and technology facilitator. We do not create, own, publish, manufacture, endorse, or guarantee products or services offered by independent sellers.</p>
                <p>Transactions conducted through the platform are generally between buyers and independent sellers.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. No Professional Advice</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Any information provided on GenZaic, including articles, templates, guides, analytics, educational materials, AI-generated recommendations, marketplace insights, or compliance-related features, is provided for informational purposes only.</p>
                <p>Nothing on the platform should be interpreted as:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Legal advice</li>
                  <li>Tax advice</li>
                  <li>Financial advice</li>
                  <li>Investment advice</li>
                  <li>Accounting advice</li>
                  <li>Business consulting advice</li>
                  <li>Professional regulatory advice</li>
                </ul>
                <p>Users should consult qualified professionals before making legal, financial, tax, or business decisions.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Seller Content Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Independent sellers are solely responsible for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Product listings</li>
                  <li>Product descriptions</li>
                  <li>Pricing</li>
                  <li>Product quality</li>
                  <li>Copyright ownership</li>
                  <li>Licensing rights</li>
                  <li>Compliance with applicable laws</li>
                </ul>
                <p>GenZaic does not verify every listing and does not guarantee that seller-generated content is accurate, complete, lawful, reliable, or suitable for any particular purpose.</p>
                <p>Buyers purchase products at their own discretion and risk.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. AI Feature Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic may provide AI-powered features such as:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Product description generation</li>
                  <li>Pricing suggestions</li>
                  <li>Sales insights</li>
                  <li>Marketplace analytics</li>
                  <li>Customer support assistance</li>
                  <li>Content recommendations</li>
                </ul>
                <p>AI-generated outputs may contain inaccuracies, omissions, outdated information, or unintended results.</p>
                <p>Users remain solely responsible for reviewing, validating, and deciding whether to rely on AI-generated outputs. GenZaic shall not be responsible for decisions made based on AI-generated recommendations.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Digital Product Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Products sold through GenZaic are created and uploaded by independent sellers.</p>
                <p>GenZaic does not guarantee:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Product quality</li>
                  <li>Accuracy</li>
                  <li>Completeness</li>
                  <li>Compatibility with specific devices or software</li>
                  <li>Commercial usefulness</li>
                  <li>Educational outcomes</li>
                  <li>Business success</li>
                  <li>Income generation</li>
                  <li>Customer satisfaction</li>
                </ul>
                <p>Individual experiences and results may vary.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Earnings and Income Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Certain products available on the platform may discuss business, freelancing, marketing, investing, entrepreneurship, education, or income generation.</p>
                <p>Any earnings examples, testimonials, case studies, or success stories are illustrative only and should not be interpreted as guarantees of future performance or results.</p>
                <p>Actual outcomes depend on numerous factors, including individual effort, experience, market conditions, skills, and circumstances.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Payment Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Payments made through GenZaic are processed by authorized third-party payment providers.</p>
                <p>GenZaic is not responsible for delays or failures resulting from:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Banking system outages</li>
                  <li>Payment gateway disruptions</li>
                  <li>UPI network failures</li>
                  <li>Card network issues</li>
                  <li>Technical processing errors</li>
                  <li>Delayed settlements by financial institutions</li>
                  <li>Third-party payment provider interruptions</li>
                </ul>
                <p>Users may also be subject to the terms and policies of those payment providers.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Platform Availability</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>While we strive to provide reliable services, GenZaic does not guarantee uninterrupted, secure, or error-free operation of the platform.</p>
                <p>Temporary interruptions may occur due to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Scheduled maintenance</li>
                  <li>Technical failures</li>
                  <li>Security incidents</li>
                  <li>Internet connectivity issues</li>
                  <li>Third-party infrastructure failures</li>
                  <li>System upgrades</li>
                  <li>Unexpected operational events</li>
                </ul>
                <p>We reserve the right to modify, suspend, or discontinue features or services without prior notice.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. External Links and Third-Party Services</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>The platform may contain links or integrations with third-party websites, payment providers, social media platforms, analytics services, or external resources.</p>
                <p>GenZaic does not control or endorse such third-party services and is not responsible for their content, availability, security, or privacy practices.</p>
                <p>Users interact with third-party services at their own risk and should review their respective policies.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. No Warranty</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To the fullest extent permitted by applicable law, GenZaic and its services are provided on an &quot;as is&quot; and &quot;as available&quot; basis.</p>
                <p>We make no warranties or representations, express or implied, regarding:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Continuous availability</li>
                  <li>Accuracy</li>
                  <li>Reliability</li>
                  <li>Merchantability</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Error-free operation</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To the maximum extent permitted by applicable law, GenZaic shall not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, including but not limited to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Loss of profits</li>
                  <li>Loss of business opportunities</li>
                  <li>Business interruption</li>
                  <li>Data loss</li>
                  <li>Reputational harm</li>
                  <li>Missed opportunities</li>
                  <li>Buyer-seller disputes</li>
                  <li>Product defects</li>
                  <li>Intellectual property claims arising from seller content</li>
                </ul>
                <p>Users assume responsibility for their decisions and use of the platform.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Compliance Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic may provide features such as GST invoice generation, seller verification, analytics, compliance assistance, or AI-powered recommendations.</p>
                <p>These features are designed for convenience only and do not guarantee compliance with legal, tax, accounting, or regulatory obligations.</p>
                <p>Users remain solely responsible for meeting their own legal and compliance requirements.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Force Majeure</h2>
              <p className="text-muted-foreground leading-relaxed">
                GenZaic shall not be responsible for delays, interruptions, or failures caused by events beyond our reasonable control, including natural disasters, government actions, war, cyberattacks, internet failures, power outages, pandemics, labor disputes, or failures of third-party infrastructure or payment systems.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">14. Changes to This Disclaimer</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may update this Disclaimer from time to time.</p>
                <p>The latest version will be published with an updated &quot;Last Updated&quot; date. Continued use of the platform after changes become effective constitutes acceptance of the revised Disclaimer.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">15. Contact Information</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>For questions regarding this Disclaimer, please contact:</p>
                <p>
                  <strong className="text-foreground">GenZaic</strong><br />
                  Business Email: <a href="mailto:business@genzaic.com" className="text-primary hover:underline">business@genzaic.com</a><br />
                  Website: <a href="https://www.genzaic.com" className="text-primary hover:underline">www.genzaic.com</a><br />
                  Address: Moradabad, Uttar Pradesh, India
                </p>
                <p>By using GenZaic, you acknowledge that you have read, understood, and agreed to this Disclaimer.</p>
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
