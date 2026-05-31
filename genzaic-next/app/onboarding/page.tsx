"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles, CreditCard, Paintbrush, Rocket, Loader2, type LucideIcon } from "lucide-react"
import { useCompleteOnboarding, useSkipOnboarding, useSelectPlan } from "@/lib/queries/onboarding"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Spotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Choose Plan", icon: CreditCard },
  { id: 3, title: "Ready!", icon: Check },
]

type Plan = {
  id: string
  label: string
  price: string
  description: string
  features: string[]
  icon: LucideIcon
  footer: string
  comingSoon?: boolean
}

const PLANS: Plan[] = [
  {
    id: "creator",
    label: "I'm a Creator",
    price: "25% Per Sell",
    description: "Perfect starting point for individual creators looking to monetize their skills",
    icon: Paintbrush,
    features: [
      "Product listing & storefront",
      "Analytics & reporting",
      "Marketing support",
      "Community access",
      "Customer reviews & ratings",
      "Storefront customization",
      "24/7 customer support",
    ],
    footer: "Perfect for individual creators",
  },
  {
    id: "startup",
    label: "I'm a Startup Owner",
    price: "₹xxxx",
    description: "Scale your business with advanced tools, analytics, and premium features",
    icon: Rocket,
    features: [
      "Everything in Creator Plan",
      "Advanced analytics & insights",
      "Team access & collaboration",
      "Storefront customization",
      "Advanced sales funnels",
      "Premium community access",
      "Loyal customer program",
      "Ad campaigns within marketplace",
    ],
    footer: "Advanced tools for growing your business",
    comingSoon: true,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState("creator")
  const { mutateAsync: selectPlan } = useSelectPlan()
  const { mutateAsync: completeOnboarding } = useCompleteOnboarding()
  const { mutateAsync: skipOnboarding, isPending: isSkipping } = useSkipOnboarding()
  // Covers the whole final-click sequence (plan-await + complete + nav) so the
  // button stays in a loading state until we've actually left /onboarding.
  const [isFinalizing, setIsFinalizing] = useState(false)
  // Holds the in-flight plan mutation so step 2 -> 3 can advance optimistically
  // while step 3's final action still waits for the DB write + JWT rotation
  // to settle before navigating to the seller-only dashboard.
  const planPromiseRef = useRef<Promise<unknown> | null>(null)

  const handleNext = async () => {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      // Fire the plan mutation but don't block the step transition on it.
      planPromiseRef.current = selectPlan({ plan: selectedPlan }).catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to select plan"))
        throw err
      })
      setStep(3)
      return
    }
    // step === 3
    setIsFinalizing(true)
    try {
      if (planPromiseRef.current) {
        await planPromiseRef.current
      }
      await completeOnboarding()
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to complete onboarding"))
      setIsFinalizing(false)
    }
  }

  const handleSkip = async () => {
    try {
      await skipOnboarding()
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to skip onboarding"))
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(139,92,246,0.45)"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 60, -40, 0], y: [0, -50, 40, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[8%] left-[4%] w-[420px] h-[420px] bg-purple-400/45 dark:bg-purple-600/40 rounded-full blur-[100px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -50, 40, 0], y: [0, 50, -40, 0], scale: [1, 0.9, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[4%] right-[4%] w-[480px] h-[480px] bg-indigo-400/40 dark:bg-indigo-500/40 rounded-full blur-[110px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-pink-400/35 dark:bg-pink-500/30 rounded-full blur-[100px]"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -40, 30, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-fuchsia-400/30 dark:bg-fuchsia-500/25 rounded-full blur-[90px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30" />
      </div>
      <div className={cn("relative z-10 w-full space-y-6", step === 2 ? "max-w-4xl" : "max-w-xl")}>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl">GenZaic</span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2 max-w-xs mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to GenZaic!</CardTitle>
              <CardDescription>Let&apos;s set up your creator store in just a few steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {["Upload your digital products", "Customize your storefront", "Start earning immediately"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <Button onClick={handleNext} size="lg" className="w-full gradient-primary text-white gap-2" disabled={isSkipping}>
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSkip} disabled={isSkipping}>
                {isSkipping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Skipping…
                  </>
                ) : (
                  "Skip for now"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Choose your plan</h2>
              <p className="text-muted-foreground">You can upgrade anytime</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {PLANS.map((plan) => {
                const Icon = plan.icon
                const disabled = plan.comingSoon
                const active = selectedPlan === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => !disabled && setSelectedPlan(plan.id)}
                    disabled={disabled}
                    aria-pressed={active}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-6 pt-8 transition-all relative flex flex-col bg-card",
                      active && !disabled && "border-primary bg-primary/5 shadow-lg",
                      !active && !disabled && "border-border hover:border-primary/40 hover:shadow-md",
                      disabled && "border-border opacity-80 cursor-not-allowed"
                    )}
                  >
                    {plan.comingSoon && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-foreground/90 text-background text-xs rounded-full font-medium inline-flex items-center gap-1">
                        Coming Soon
                      </span>
                    )}
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                        {plan.price}
                      </span>
                      <h3 className={cn("text-xl font-bold", active && !disabled && "text-primary")}>{plan.label}</h3>
                      <p className="text-sm text-muted-foreground -mt-1">{plan.description}</p>
                    </div>
                    <div className="mt-6">
                      <p className="text-center text-sm font-semibold mb-3">Included Benefits</p>
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </span>
                            <span className="text-foreground/80">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="mt-5 text-center text-xs italic text-muted-foreground">{plan.footer}</p>
                  </button>
                )
              })}
            </div>
            <Button onClick={handleNext} size="lg" className="w-full md:w-auto md:mx-auto md:flex gradient-primary text-white gap-2 md:px-10">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-12 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Check className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
              <p className="text-muted-foreground">Your store is ready. Start adding products and customize your storefront.</p>
              <Button onClick={handleNext} size="lg" className="gradient-primary text-white gap-2 min-w-[200px]" disabled={isFinalizing}>
                {isFinalizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Setting things up…
                  </>
                ) : (
                  <>
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
