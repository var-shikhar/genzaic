import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { Logo } from "@/components/ui/logo"
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
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Data, Your Trust</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: 11 June 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-10">
            <div className="bg-card rounded-2xl border border-border p-8 space-y-3 text-muted-foreground leading-relaxed">
              <p>Welcome to GenZaic.</p>
              <p>
                At GenZaic, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices and rights you have regarding your data.
              </p>
              <p>
                By accessing or using GenZaic, you acknowledge that your personal information will be handled in accordance with this Privacy Policy.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Who We Are</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic is a digital commerce platform that enables creators, educators, freelancers, businesses, and digital sellers to create online storefronts, sell digital products and services, receive payments, generate invoices, and manage their businesses.</p>
                <p>We process personal information in accordance with applicable laws, including the Digital Personal Data Protection Act, 2023 (India), and other relevant legal requirements.</p>
                <p>If you have questions regarding this Privacy Policy, you may contact us at:</p>
                <p>
                  <strong className="text-foreground">Privacy Email:</strong> <a href="mailto:privacy@genzaic.com" className="text-primary hover:underline">privacy@genzaic.com</a><br />
                  <strong className="text-foreground">Business Email:</strong> <a href="mailto:business@genzaic.com" className="text-primary hover:underline">business@genzaic.com</a>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Depending on how you use our platform, we may collect the following categories of information.</p>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.1 Identity and Contact Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Business name or profile details</li>
                    <li>Billing information, where applicable</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.2 Seller Verification Information</h3>
                  <p>To verify sellers and facilitate payouts, we may collect:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>PAN details or other government identification where required</li>
                    <li>Bank account information</li>
                    <li>KYC-related information</li>
                    <li>GST details, if provided</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.3 Transaction Information</h3>
                  <p>We may collect:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Order history</li>
                    <li>Purchase records</li>
                    <li>Payment confirmations</li>
                    <li>Invoice information</li>
                    <li>Payout records</li>
                    <li>Refund or dispute information</li>
                  </ul>
                  <p>Payments are processed by trusted third-party payment providers. We do not store your complete debit card details, credit card details, UPI PIN, or internet banking credentials.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.4 Product and Content Information</h3>
                  <p>Sellers may upload:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Product titles and descriptions</li>
                    <li>Images and thumbnails</li>
                    <li>PDFs</li>
                    <li>Videos</li>
                    <li>Audio files</li>
                    <li>Templates</li>
                    <li>Courses</li>
                    <li>Software</li>
                    <li>Other digital content</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2.5 Technical and Usage Information</h3>
                  <p>When you use our platform, we may automatically collect:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IP address</li>
                    <li>Browser type</li>
                    <li>Device information</li>
                    <li>Operating system</li>
                    <li>Log files</li>
                    <li>Cookies</li>
                    <li>Usage analytics</li>
                    <li>Pages visited and interactions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Legal Basis for Processing</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We process personal information only where there is a valid reason to do so, including:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Providing the services you request</li>
                  <li>Creating and managing user accounts</li>
                  <li>Processing payments and seller payouts</li>
                  <li>Verifying identities and preventing fraud</li>
                  <li>Complying with legal, accounting, tax, and regulatory obligations</li>
                  <li>Improving platform performance and security</li>
                  <li>Responding to customer support requests</li>
                  <li>Where required, based on your consent</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. How We Use Your Information</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may use your information to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Register and manage your account</li>
                  <li>Verify seller identity and eligibility</li>
                  <li>Process transactions and payouts</li>
                  <li>Generate invoices and transaction records</li>
                  <li>Deliver purchased digital products</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Provide customer support</li>
                  <li>Improve platform features and user experience</li>
                  <li>Send important service-related communications</li>
                  <li>Enforce our Terms and policies</li>
                  <li>Comply with applicable laws and regulatory requirements</li>
                </ul>
                <p>We do not sell your personal information to third parties.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Digital Products and Seller Content</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic allows sellers to upload digital products and related content.</p>
                <p>Sellers retain ownership of the content they upload. By uploading content, sellers grant GenZaic a limited, non-exclusive license to host, store, display, distribute, and deliver that content solely for operating, maintaining, promoting, and improving the platform and fulfilling customer purchases.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. AI-Powered Features</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic may use artificial intelligence technologies to assist users by:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Improving product descriptions</li>
                  <li>Suggesting pricing strategies</li>
                  <li>Analyzing marketplace performance</li>
                  <li>Assisting with customer support</li>
                  <li>Generating recommendations and insights</li>
                </ul>
                <p>AI-generated outputs are intended to assist users and should not be considered legal, financial, tax, accounting, or professional advice. Users remain responsible for reviewing and verifying AI-generated content before relying on it.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Keep users logged in</li>
                  <li>Remember preferences</li>
                  <li>Improve platform functionality</li>
                  <li>Analyze usage patterns</li>
                  <li>Enhance security and performance</li>
                </ul>
                <p>Most web browsers allow you to manage or disable cookies through browser settings. Some features of the platform may not function properly if cookies are disabled.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Sharing of Information</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We do not sell or rent your personal information.</p>
                <p>We may share information only when necessary with:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">Payment Service Providers</strong> — to process payments, refunds, and payouts.</li>
                  <li><strong className="text-foreground">Verification and KYC Providers</strong> — to verify identity, prevent fraud, and satisfy regulatory requirements.</li>
                  <li><strong className="text-foreground">Service Providers</strong> — who assist with hosting, analytics, communications, infrastructure, or platform operations.</li>
                  <li><strong className="text-foreground">Legal or Government Authorities</strong> — where disclosure is required by applicable law, court order, or lawful governmental request.</li>
                  <li><strong className="text-foreground">Business Transfers</strong> — in connection with a merger, acquisition, restructuring, financing, or sale of all or part of our business.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Data Security</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We implement reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, misuse, disclosure, alteration, or destruction.</p>
                <p>However, no online platform or method of electronic storage can guarantee absolute security. Users are responsible for protecting their account credentials and using strong passwords.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Data Breach Response</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If we become aware of a data breach affecting personal information, we will investigate the incident and take appropriate corrective measures.</p>
                <p>Where required by applicable law, we may notify affected users and relevant authorities within the timeframes prescribed by law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Data Retention</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We retain personal information only for as long as reasonably necessary to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide our services</li>
                  <li>Maintain business and transaction records</li>
                  <li>Process payments and payouts</li>
                  <li>Resolve disputes</li>
                  <li>Prevent fraud</li>
                  <li>Enforce our agreements</li>
                  <li>Comply with legal, tax, accounting, or regulatory obligations</li>
                </ul>
                <p>Some records, including invoices and financial records, may be retained for longer periods where required by law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Your Rights</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Subject to applicable law, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate or incomplete information</li>
                  <li>Request deletion of certain personal information</li>
                  <li>Withdraw consent where processing is based on consent</li>
                  <li>Object to or request restrictions on certain processing activities where permitted by law</li>
                </ul>
                <p>You may exercise these rights by contacting us using the details provided below. Certain requests may be limited where retention is required by law or for legitimate business purposes.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Children&apos;s Privacy</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic is not intended for individuals under the age of 18.</p>
                <p>We do not knowingly collect personal information from children. If we become aware that such information has been collected, we will take reasonable steps to remove it in accordance with applicable law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">14. Third-Party Services</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Our platform may integrate with or contain links to third-party services, including payment gateways, analytics providers, cloud services, social media platforms, and external websites.</p>
                <p>These third parties operate under their own privacy policies, and GenZaic is not responsible for their independent privacy practices.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">15. International Data Processing</h2>
              <p className="text-muted-foreground leading-relaxed">
                As our services expand, personal information may be processed or stored in jurisdictions outside your state or country, subject to appropriate safeguards and applicable legal requirements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">16. Changes to This Privacy Policy</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements, or business practices.</p>
                <p>The updated version will be published with a revised &quot;Last Updated&quot; date. Continued use of GenZaic after changes become effective constitutes acceptance of the revised Privacy Policy.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">17. Contact and Grievance Redressal</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If you have any questions, requests, or concerns regarding this Privacy Policy or our handling of personal information, please contact us:</p>
                <p>
                  <strong className="text-foreground">GenZaic</strong><br />
                  <strong className="text-foreground">Privacy Email:</strong> <a href="mailto:privacy@genzaic.com" className="text-primary hover:underline">privacy@genzaic.com</a><br />
                  <strong className="text-foreground">Business Email:</strong> <a href="mailto:business@genzaic.com" className="text-primary hover:underline">business@genzaic.com</a><br />
                  <strong className="text-foreground">Website:</strong> <a href="https://www.genzaic.com" className="text-primary hover:underline">www.genzaic.com</a><br />
                  <strong className="text-foreground">Address:</strong> Moradabad, Uttar Pradesh, India
                </p>
                <p>We will make reasonable efforts to acknowledge and respond to privacy-related inquiries in a timely manner and in accordance with applicable law.</p>
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
