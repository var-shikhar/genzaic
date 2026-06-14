import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import Image from "next/image"
import logoFull from "../../public/logo.png"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Terms & Conditions | GenZaic",
  description: "Read the terms and conditions for using GenZaic, India's digital product marketplace.",
}

export default function TermsPage() {
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
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Legal Agreement</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-4 leading-tight">
            Terms &amp; Conditions
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
                Welcome to GenZaic. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the GenZaic website, platform, applications, products, and services. By accessing or using GenZaic, you agree to be bound by these Terms. If you do not agree, please discontinue use of the platform.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Definitions</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>For the purposes of these Terms:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong className="text-foreground">&quot;GenZaic,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;</strong> refers to GenZaic and its operators.</li>
                  <li><strong className="text-foreground">&quot;User&quot;</strong> means any person who accesses or uses the platform.</li>
                  <li><strong className="text-foreground">&quot;Seller&quot;</strong> means a user who uploads, lists, or sells digital products or services.</li>
                  <li><strong className="text-foreground">&quot;Buyer&quot;</strong> means a user who purchases digital products or services.</li>
                  <li><strong className="text-foreground">&quot;Content&quot;</strong> includes any file, ebook, course, template, software, document, image, video, audio, code, or other material uploaded to the platform.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Platform Role</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic provides technology infrastructure that enables creators, educators, freelancers, businesses, and digital sellers to create storefronts, list products, process payments, generate invoices, and deliver digital goods.</p>
                <p>Unless expressly stated otherwise, GenZaic acts solely as a technology platform and marketplace facilitator. We do not create, own, publish, guarantee, or endorse products uploaded by independent sellers and are not responsible for their accuracy, legality, quality, safety, or fitness for any particular purpose.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Eligibility</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To use GenZaic, you must:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Be at least 18 years of age.</li>
                  <li>Have the legal capacity to enter into binding agreements.</li>
                  <li>Provide accurate and complete information.</li>
                  <li>Comply with all applicable laws and regulations.</li>
                </ul>
                <p>We reserve the right to suspend or terminate accounts containing false, misleading, or fraudulent information.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Account Registration and Security</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Maintaining the confidentiality of your login credentials.</li>
                  <li>Keeping your account information up to date.</li>
                  <li>All activities conducted through your account.</li>
                </ul>
                <p>You must notify us promptly if you believe your account has been compromised or accessed without authorization.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Seller Responsibilities</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Sellers are solely responsible for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Products they upload.</li>
                  <li>Product descriptions and pricing.</li>
                  <li>Copyright ownership and intellectual property rights.</li>
                  <li>Compliance with applicable laws and taxes.</li>
                  <li>Customer support obligations.</li>
                  <li>Accuracy of claims made in listings.</li>
                </ul>
                <p>Sellers must ensure that uploaded content does not infringe third-party rights or violate applicable law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Prohibited Content and Conduct</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Users may not upload, distribute, or promote:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Copyright-infringing or pirated content.</li>
                  <li>Illegal products or services.</li>
                  <li>Fraudulent or deceptive materials.</li>
                  <li>Malware or malicious software.</li>
                  <li>Hate speech or unlawful content.</li>
                  <li>Adult or sexually explicit material prohibited by law.</li>
                  <li>Content that violates intellectual property rights or Indian law.</li>
                </ul>
                <p>GenZaic reserves the right to remove content or suspend accounts without prior notice where necessary.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Payments</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Payments may be processed through authorized third-party payment providers.</p>
                <p>By making a purchase, buyers authorize the applicable payment provider to process the transaction.</p>
                <p>GenZaic does not store complete debit card numbers, credit card numbers, UPI PINs, or internet banking credentials.</p>
                <p>Applicable transaction fees or taxes may apply as disclosed on the platform.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Seller Payouts</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Seller payouts may be subject to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Successful payment collection.</li>
                  <li>Identity verification.</li>
                  <li>KYC compliance.</li>
                  <li>Fraud prevention checks.</li>
                  <li>Applicable payment partner policies.</li>
                  <li>Regulatory or legal requirements.</li>
                </ul>
                <p>GenZaic may delay or withhold payouts where fraud, disputes, chargebacks, or legal concerns are reasonably suspected.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Taxes and Compliance</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Sellers remain solely responsible for determining and fulfilling their tax, GST, accounting, and legal obligations.</p>
                <p>GenZaic may provide invoice generation or compliance-related tools as convenience features only. Such tools do not constitute legal, tax, or accounting advice.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Digital Product Delivery</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Digital products are generally delivered automatically after successful payment.</p>
                <p>For the purposes of these Terms, a digital product shall be considered delivered when the buyer is successfully provided with a download link, account access, license key, or other means of accessing the purchased content.</p>
                <p>Buyers are encouraged to download and securely store purchased files promptly. GenZaic may apply reasonable download limits or security measures to protect sellers and the platform.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Refunds, Disputes, and Chargebacks</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Refund eligibility is governed by the GenZaic Refund and Cancellation Policy.</p>
                <p>Because digital products are often delivered instantly, refunds may be limited except where required by law or where products are not delivered, materially misrepresented, or affected by verified fraud.</p>
                <p>Before initiating a chargeback or payment dispute with a bank or payment provider, buyers agree to make reasonable efforts to contact the seller or GenZaic Support to seek resolution.</p>
                <p>Fraudulent or abusive chargebacks may result in suspension of accounts, withholding of payouts, cancellation of platform access, or other actions permitted by law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Intellectual Property</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Sellers retain ownership of the content they upload.</p>
                <p>By uploading content to GenZaic, sellers grant GenZaic a non-exclusive, worldwide, royalty-free license to host, store, display, distribute, market, and deliver such content solely for operating, maintaining, improving, and promoting the platform and fulfilling customer purchases.</p>
                <p>Nothing in these Terms transfers ownership of seller content to GenZaic.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Buyer Usage Rights</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Unless otherwise specified by the seller:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Purchases grant a limited license to use the content and do not transfer ownership.</li>
                  <li>Buyers receive a personal, non-transferable right to access or use purchased products.</li>
                  <li>Buyers may not reproduce, redistribute, sublicense, resell, publicly share, or commercially exploit purchased content without authorization.</li>
                </ul>
                <p>Violations may result in account suspension and legal action.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">14. AI-Powered Features</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic may provide AI-powered features such as product optimization, pricing suggestions, description generation, customer support assistance, analytics, and recommendations.</p>
                <p>AI-generated outputs are provided for informational purposes only and may contain inaccuracies. Users remain responsible for reviewing and verifying AI-generated content before relying on it.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">15. Platform Availability</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>While we strive to maintain reliable service, GenZaic does not guarantee uninterrupted or error-free availability.</p>
                <p>We may modify, suspend, update, or discontinue features or services for maintenance, security, legal compliance, or operational reasons without prior notice.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">16. Fraud and Misuse</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Users must not engage in fraudulent transactions, payment abuse, fake purchases, account misuse, unauthorized access attempts, or activities intended to disrupt the platform.</p>
                <p>GenZaic reserves the right to investigate suspected misconduct and take appropriate action, including suspension, termination, reporting to authorities, or recovery of losses where permitted by law.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">17. Suspension and Termination</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may suspend, restrict, or terminate user accounts if:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>These Terms are violated.</li>
                  <li>Fraud or illegal activity is suspected.</li>
                  <li>Security risks arise.</li>
                  <li>Required information cannot be verified.</li>
                  <li>Continued access poses risk to the platform or other users.</li>
                </ul>
                <p>Termination does not affect obligations or liabilities that arose before termination.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">18. Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To the fullest extent permitted by law, GenZaic shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, business interruption, or data loss.</p>
                <p>GenZaic is not responsible for seller-generated content, buyer misuse of purchased products, or disputes arising between buyers and sellers.</p>
                <p>The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">19. Indemnification</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>You agree to indemnify and hold harmless GenZaic, its operators, employees, and affiliates from claims, damages, liabilities, costs, and expenses arising from:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Your violation of these Terms.</li>
                  <li>Content you upload.</li>
                  <li>Intellectual property disputes.</li>
                  <li>Misuse of the platform.</li>
                  <li>Violation of applicable laws or third-party rights.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">20. Third-Party Services</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic may integrate with third-party providers, including payment gateways, analytics tools, cloud infrastructure providers, communication services, and social media platforms.</p>
                <p>Such services operate under their own terms and privacy policies, and GenZaic is not responsible for their independent practices.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">21. Force Majeure</h2>
              <p className="text-muted-foreground leading-relaxed">
                GenZaic shall not be liable for delays or failures resulting from events beyond its reasonable control, including natural disasters, acts of government, internet outages, cyberattacks, labor disputes, war, pandemics, power failures, or failures of third-party infrastructure or payment providers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">22. Changes to These Terms</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may modify these Terms from time to time.</p>
                <p>Updated versions will be published with a revised &quot;Last Updated&quot; date. Continued use of GenZaic after changes become effective constitutes acceptance of the revised Terms.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">23. Governing Law and Jurisdiction</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>These Terms shall be governed by and interpreted in accordance with the laws of India.</p>
                <p>Any disputes arising out of or relating to these Terms or use of the platform shall be subject to the exclusive jurisdiction of the competent courts located in Uttar Pradesh, India.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">24. Contact Information</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>For questions regarding these Terms, please contact:</p>
                <ul className="list-none space-y-1">
                  <li><strong className="text-foreground">GenZaic</strong></li>
                  <li>Email: <a href="mailto:business@genzaic.com" className="text-primary hover:underline">business@genzaic.com</a></li>
                  <li>Website: <a href="https://www.genzaic.com" className="text-primary hover:underline">www.genzaic.com</a></li>
                  <li>Address: Moradabad, Uttar Pradesh, India</li>
                </ul>
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
