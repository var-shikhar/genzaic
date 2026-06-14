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
          <p className="text-muted-foreground">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-10">
            <div className="bg-card rounded-2xl border border-border p-8">
              <p className="text-muted-foreground leading-relaxed">
                These Terms and Conditions (&quot;Terms&quot;) govern your use of the GenZaic platform operated by GenZaic (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By accessing or using GenZaic, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the platform.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Definitions</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                <li><strong className="text-foreground">&quot;Platform&quot;</strong> refers to the GenZaic website, application, and all related services.</li>
                <li><strong className="text-foreground">&quot;Creator&quot; / &quot;Seller&quot;</strong> refers to any user who lists and sells digital products on GenZaic.</li>
                <li><strong className="text-foreground">&quot;Buyer&quot;</strong> refers to any user who purchases digital products through GenZaic.</li>
                <li><strong className="text-foreground">&quot;Digital Products&quot;</strong> refers to downloadable digital goods including but not limited to PDFs, templates, code, designs, e-books, and courses.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Account Registration</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To use certain features of GenZaic, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate, current, and complete registration information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and not share it with others</li>
                  <li>Be responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Creator / Seller Obligations</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>As a Creator on GenZaic, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Only upload and sell digital products that you own or have the legal right to distribute</li>
                  <li>Provide accurate descriptions, previews, and pricing for your products</li>
                  <li>Not upload content that is illegal, infringing, harmful, or violates any third-party rights</li>
                  <li>Complete KYC verification as required for receiving payouts</li>
                  <li>Comply with all applicable Indian laws including GST regulations</li>
                  <li>Respond to buyer inquiries in a timely manner</li>
                </ul>
                <p>GenZaic reserves the right to remove any products that violate these obligations without prior notice.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Buyer Obligations</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>As a Buyer on GenZaic, you agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use purchased digital products only for personal or authorized purposes</li>
                  <li>Not redistribute, resell, or share purchased products without the creator&apos;s explicit permission</li>
                  <li>Not attempt to reverse-engineer, decompile, or extract source materials from purchased products</li>
                  <li>Provide accurate payment information for transactions</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Payments & Platform Fees</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>All transactions on GenZaic are processed through our payment partner, Razorpay. By making a purchase, you agree to Razorpay&apos;s terms of service.</p>
                <p>GenZaic charges a platform fee on each transaction. The applicable fee percentage is disclosed to creators at the time of account setup and in the dashboard. Platform fees are deducted before payouts are made to creators.</p>
                <p>Payouts to creators are processed on a T+7 cycle (7 days after the transaction) to the bank account linked during KYC verification.</p>
                <p>All prices on GenZaic are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Creators retain full ownership and intellectual property rights over the digital products they upload and sell on GenZaic. By listing a product, creators grant GenZaic a non-exclusive license to display, promote, and distribute the product through the platform.</p>
                <p>The GenZaic brand, logo, interface design, and platform technology are the intellectual property of GenZaic and may not be used without written permission.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Prohibited Activities</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Upload malicious software, viruses, or harmful content</li>
                  <li>Attempt to hack, disrupt, or gain unauthorized access to the platform</li>
                  <li>Create fake accounts or impersonate others</li>
                  <li>Engage in fraudulent transactions or payment manipulation</li>
                  <li>Scrape or harvest data from the platform without permission</li>
                  <li>Use the platform to distribute spam or unsolicited communications</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>GenZaic acts as a marketplace connecting creators and buyers. We are not responsible for:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The quality, accuracy, or legality of digital products listed by creators</li>
                  <li>Any disputes between buyers and sellers regarding product quality or delivery</li>
                  <li>Any indirect, incidental, special, or consequential damages arising from your use of the platform</li>
                  <li>Loss of data, revenue, or profits resulting from platform downtime or technical issues</li>
                </ul>
                <p>Our total liability for any claim related to the platform shall not exceed the amount of fees you have paid to GenZaic in the 12 months preceding the claim.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Termination</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>You may delete your account at any time through your account settings. GenZaic reserves the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.</p>
                <p>Upon termination, your right to use the platform ceases immediately. Any pending payouts will be processed subject to our verification procedures.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Governing Law & Disputes</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>These Terms are governed by the laws of India. Any disputes arising from or related to these Terms or the use of GenZaic shall be subject to the exclusive jurisdiction of the courts in India.</p>
                <p>We encourage users to contact us at <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a> to resolve disputes amicably before pursuing legal remedies.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Changes to These Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Continued use of GenZaic after changes constitutes acceptance of the revised Terms. We will notify registered users via email for material changes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please reach out to us at <a href="mailto:support@genzaic.com" className="text-primary hover:underline">support@genzaic.com</a>.
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
