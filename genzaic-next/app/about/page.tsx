import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Heart, Sparkles, Users, Zap } from "lucide-react"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "About GenZaic",
  description: "Learn about GenZaic - India's digital product marketplace for creators.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                G
              </span>
            </div>
            <span className="font-bold text-xl text-foreground">GenZaic</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="gradient-primary hover:opacity-90 transition-opacity"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/40 to-background" />
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="container mx-auto relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Made with love in India
            </span>
          </div>
          <h1 className="font-bold text-4xl md:text-6xl text-foreground mb-6 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GenZaic
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            GenZaic is India's premier digital product marketplace built
            specifically for the next generation of creators. We believe every
            creator deserves a fair shot at building a sustainable digital
            business.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
            <h2 className="font-bold text-2xl md:text-3xl text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              We're on a mission to empower Indian creators to monetize their
              knowledge, skills, and creativity through a platform that truly
              understands the Indian market — from UPI payments to GST
              compliance.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              GenZaic removes all barriers to entry. No setup fees, no monthly
              costs. Just create, upload, and start earning. We only make money
              when you make money.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-bold text-2xl md:text-3xl text-foreground text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Heart,
                title: "Creator First",
                description:
                  "Every decision we make starts with: 'How does this help creators?' We are advocates for the people who build on our platform.",
              },
              {
                icon: Zap,
                title: "Zero Friction",
                description:
                  "Getting started should take minutes, not days. We obsess over removing every unnecessary step between 'I have an idea' and 'I'm earning money'.",
              },
              {
                icon: Users,
                title: "Community",
                description:
                  "We're building more than a marketplace — we're building a thriving community of Indian digital creators who support and inspire each other.",
              },
              {
                icon: Sparkles,
                title: "Transparency",
                description:
                  "No hidden fees, no surprises. We believe in honest pricing and clear communication. What you see is exactly what you get.",
              },
            ].map((value, i) => (
              <Card
                key={i}
                className="border-border hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "₹0", label: "Setup Cost" },
              { number: "5 min", label: "Time to Launch" },
              { number: "100%", label: "UPI Support" },
              { number: "T+7", label: "Bank Payouts" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl text-foreground mb-4">
            Ready to Join GenZaic?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start selling your digital products today. Zero setup fees,
            unlimited potential.
          </p>
          <Button
            size="lg"
            asChild
            className="gradient-primary hover:opacity-90 transition-opacity h-12 px-8"
          >
            <Link href="/signup">
              Create Your Free Store
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
