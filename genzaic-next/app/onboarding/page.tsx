"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, ArrowRight, Sparkles, Store, CreditCard } from "lucide-react"
import { useCompleteOnboardingMutation, useSkipOnboardingMutation, useSelectPlanMutation } from "@/store/api/onboardingApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Welcome", icon: Sparkles },
  { id: 2, title: "Choose Plan", icon: CreditCard },
  { id: 3, title: "Ready!", icon: Check },
]

const PLANS = [
  {
    id: "creator",
    label: "Creator",
    price: "Free",
    description: "Perfect for starting out",
    features: ["Up to 5 products", "Basic analytics", "File downloads", "5% platform fee"],
  },
  {
    id: "startup",
    label: "Startup",
    price: "₹499/mo",
    description: "For growing creators",
    features: ["Unlimited products", "Advanced analytics", "All delivery types", "3% platform fee", "Custom domain"],
    popular: true,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState("creator")
  const [selectPlan, { isLoading: isPlanLoading }] = useSelectPlanMutation()
  const [completeOnboarding, { isLoading: isCompleting }] = useCompleteOnboardingMutation()
  const [skipOnboarding] = useSkipOnboardingMutation()

  const handleNext = async () => {
    if (step === 2) {
      try {
        await selectPlan({ plan: selectedPlan }).unwrap()
      } catch {
        toast.error("Failed to select plan")
        return
      }
    }
    if (step < 3) {
      setStep(step + 1)
    } else {
      await completeOnboarding().unwrap()
      router.push("/dashboard")
    }
  }

  const handleSkip = async () => {
    await skipOnboarding().unwrap().catch(() => {})
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
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
              <Button onClick={handleNext} size="lg" className="w-full gradient-primary text-white gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSkip}>Skip for now</Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Choose your plan</h2>
              <p className="text-muted-foreground">You can upgrade anytime</p>
            </div>
            <div className="grid gap-4">
              {PLANS.map((plan) => (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 p-5 transition-all relative",
                    selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-primary text-white text-xs rounded-full font-medium">
                      Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={cn("font-semibold", selectedPlan === plan.id && "text-primary")}>{plan.label}</p>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <p className="font-bold">{plan.price}</p>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <Button onClick={handleNext} size="lg" className="w-full gradient-primary text-white gap-2" disabled={isPlanLoading}>
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
              <Button onClick={handleNext} size="lg" className="gradient-primary text-white gap-2" disabled={isCompleting}>
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
