import AuthLayout from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/lib/toast"
import { authAPI } from "@/lib/api/auth"
import { motion } from "framer-motion"
import { CheckCircle, Loader2, Mail } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const navigate = useNavigate()
  const location = useLocation()

  const { verifyOTP, pendingVerificationEmail, user } = useAuth()

  const email =
    location.state?.email || pendingVerificationEmail || "your@email.com"

  // Navigate based on user role after verification
  useEffect(() => {
    if (isVerified && user) {
      setTimeout(() => {
        if (user.role === "buyer" || user.onboardingComplete) {
          // Buyers skip onboarding and go straight to purchases
          navigate("/my-purchases")
        } else {
          // Sellers need to complete onboarding
          navigate("/onboarding")
        }
      }, 2000)
    }
  }, [isVerified, user, navigate])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split("")
      const newOtp = [...otp]
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + pastedCode.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")

    if (code.length !== 6) {
      toast.error(undefined, "validation.requiredField")
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyOTP(email, code)
      if (result.success) {
        setIsVerified(true)
      } else {
        // Show backend error message
        toast.error(result.message, "auth.verificationError")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : undefined
      toast.error(errorMsg, "auth.verificationError")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      const response = await authAPI.resendOTP(email)
      if (response.success) {
        setResendTimer(60)
        toast.success(undefined, "auth.verificationResent")
      } else {
        toast.error(response.message, "auth.verificationError")
      }
    } catch (error) {
      toast.error(undefined, "general.error")
    }
  }

  if (isVerified) {
    return (
      <AuthLayout
        title="Email Verified!"
        subtitle="You're all set to start your journey"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Welcome to GenZaic!
            </h3>
            <p className="text-muted-foreground">
              {user?.role === "buyer"
                ? "Redirecting you to your purchases..."
                : "Redirecting you to set up your store..."}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent to your email"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Display */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <div className="text-sm">
            <p className="text-muted-foreground">We sent a code to</p>
            <p className="font-medium text-foreground">{email}</p>
          </div>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) =>
                handleChange(index, e.target.value.replace(/\D/g, ""))
              }
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-semibold border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          ))}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity"
          disabled={isLoading || otp.join("").length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        {/* Resend */}
        <div className="text-center text-sm">
          {resendTimer > 0 ? (
            <p className="text-muted-foreground">
              Resend code in{" "}
              <span className="text-foreground font-medium">
                {resendTimer}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Resend verification code
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}

export default VerifyEmailPage
