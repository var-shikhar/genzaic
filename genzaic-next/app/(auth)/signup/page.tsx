"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, ShoppingBag, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { signupSchema, type SignupInput } from "@/lib/validations/auth"
import { useSignupMutation } from "@/store/api/authApi"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole =
    (searchParams.get("role") as "buyer" | "seller") || "buyer"

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller">(
    defaultRole,
  )
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const [signup, { isLoading }] = useSignupMutation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: defaultRole, agreeToTerms: false },
  })

  const handleRoleChange = (role: "buyer" | "seller") => {
    setSelectedRole(role)
    setValue("role", role)
  }

  const onSubmit = async (data: SignupInput) => {
    if (!agreeToTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    try {
      const result = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      }).unwrap()

      toast.success("Account created! Please verify your email.")
      router.push(`/verify-email?email=${encodeURIComponent(result.email)}`)
    } catch (err) {
      const error = err as { data?: { message?: string } }
      const message =
        error?.data?.message || "Something went wrong. Please try again."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start your digital business with GenZaic
        </p>
      </div>

      {/* Role Toggle */}
      <div className="grid grid-cols-2 gap-1 p-0.5 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => handleRoleChange("buyer")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
            selectedRole === "buyer"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Buyer
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange("seller")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
            selectedRole === "seller"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          Seller
        </button>
      </div>

      {selectedRole === "seller" && (
        <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
          <p className="text-[10px] text-primary font-medium leading-relaxed">
            Seller account: Create your storefront and start selling digital
            products with zero setup fees.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register("role")} value={selectedRole} />

        {/* Name & Email in a grid on wider screens */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              autoComplete="name"
              {...register("name")}
              className={`h-9 text-sm ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && (
              <p className="text-[10px] text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              className={`h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && (
              <p className="text-[10px] text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Password fields side by side on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 upper, 1 num"
                autoComplete="new-password"
                {...register("password")}
                className={`h-9 text-sm ${errors.password ? "border-destructive pr-9" : "pr-9"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`h-9 text-sm ${errors.confirmPassword ? "border-destructive pr-9" : "pr-9"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => {
              setAgreeToTerms(checked === true)
              setValue("agreeToTerms", checked === true)
            }}
            className="mt-0.5 h-3.5 w-3.5"
          />
          <Label
            htmlFor="agreeToTerms"
            className="text-[11px] font-normal cursor-pointer leading-snug text-muted-foreground"
          >
            I agree to GenZaic&apos;s{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-[10px] text-destructive">
            {errors.agreeToTerms.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-10 gradient-primary hover:opacity-90 transition-opacity text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
