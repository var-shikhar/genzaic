import LandingNav from "@/components/landing/LandingNav"
import HeroSection from "@/components/landing/HeroSection"
import StorePreviewSection from "@/components/landing/StorePreviewSection"
import StatsSection from "@/components/landing/StatsSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import PricingSection from "@/components/landing/PricingSection"
import MarketplaceSection from "@/components/landing/MarketplaceSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/layout/Footer"

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-background scroll-smooth"
      style={{ overflowX: "clip" }}
    >
      <LandingNav />
      <HeroSection />
      <StorePreviewSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <MarketplaceSection />
      <CTASection />
      <Footer />
    </div>
  )
}
