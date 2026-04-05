import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms & Disclaimer" }

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service & Disclaimer</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">By using GenZaic, you agree to be bound by these terms of service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Digital Products</h2>
            <p className="text-muted-foreground">
              GenZaic is a marketplace for digital products. Sellers are responsible for the quality and legality of their products.
              All sales are final unless stated otherwise by the seller.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Platform Fees</h2>
            <p className="text-muted-foreground">
              GenZaic charges a platform fee on each transaction. Fees vary by plan and are disclosed at the time of purchase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Privacy</h2>
            <p className="text-muted-foreground">
              We collect and process personal data to provide our services. We do not sell your data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              GenZaic is not liable for any indirect, incidental, or consequential damages arising from the use of our platform.
            </p>
          </section>
        </div>

        <Button asChild variant="outline" className="mt-8">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
