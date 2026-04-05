"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Upload, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { kycSchema, type KycInput } from "@/lib/validations/kyc"
import { useGetKycQuery, useSubmitKycMutation } from "@/store/api/kycApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const statusConfig = {
  not_submitted: { label: "Not Submitted", icon: AlertCircle, variant: "secondary" as const },
  pending: { label: "Under Review", icon: Clock, variant: "warning" as const },
  verified: { label: "Verified", icon: CheckCircle, variant: "success" as const },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" as const },
}

export default function KYCPage() {
  const { data: kyc, isLoading } = useGetKycQuery()
  const [submitKyc, { isLoading: isSubmitting }] = useSubmitKycMutation()
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const form = useForm<KycInput>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      documentType: "pan",
      panNumber: "",
      aadhaarNumber: "",
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  })

  const documentType = form.watch("documentType")
  const status = kyc?.verificationStatus ?? "not_submitted"
  const statusInfo = statusConfig[status]

  const onSubmit = async (values: KycInput) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "" && key !== "confirmAccountNumber") {
        formData.append(key, String(value))
      }
    })
    if (documentFile) formData.append("documentFile", documentFile)

    try {
      await submitKyc(formData).unwrap()
      toast.success("KYC submitted successfully! We'll review it within 2-3 business days.")
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } }
      toast.error(err?.data?.error || "Submission failed")
    }
  }

  if (isLoading) return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-7 w-28 rounded-full" />
      <div className="rounded-xl border p-6 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="border-t pt-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground mt-1">Complete verification to enable payouts</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={statusInfo.variant}>
          <statusInfo.icon className="h-3.5 w-3.5 mr-1.5" />
          {statusInfo.label}
        </Badge>
        {kyc?.pennyDropStatus === "success" && (
          <Badge variant="success">Bank Verified</Badge>
        )}
      </div>

      {status === "rejected" && kyc?.rejectionReason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Verification Rejected</AlertTitle>
          <AlertDescription>{kyc.rejectionReason}</AlertDescription>
        </Alert>
      )}

      {status === "verified" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">KYC Verified</h3>
            <p className="text-muted-foreground mt-2">Your identity has been verified. You can now receive payouts.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Identity & Bank Details</CardTitle>
            <CardDescription>
              Provide your identity document and bank account details for payout processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Document Type */}
                <FormField control={form.control} name="documentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="pan" id="pan" />
                          <Label htmlFor="pan">PAN Card</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="aadhaar" id="aadhaar" />
                          <Label htmlFor="aadhaar">Aadhaar Card</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {documentType === "pan" ? (
                  <FormField control={form.control} name="panNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCDE1234F" className="uppercase" {...field} value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ) : (
                  <FormField control={form.control} name="aadhaarNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXX XXXX XXXX" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {/* Document Upload */}
                <div className="space-y-2">
                  <Label>Document File</Label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {documentFile ? documentFile.name : "Upload document (JPG, PNG, PDF)"}
                    </span>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>

                {/* Bank Details */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-medium">Bank Account Details</h3>
                  <FormField control={form.control} name="accountHolderName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl><Input placeholder="As per bank records" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="confirmAccountNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Account Number</FormLabel>
                        <FormControl><Input placeholder="Re-enter account number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="ifscCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input placeholder="SBIN0001234" className="uppercase" {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bankName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl><Input placeholder="State Bank of India" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-primary text-white" disabled={isSubmitting || status === "pending"}>
                  {isSubmitting ? "Submitting..." : status === "pending" ? "Verification in Progress" : "Submit KYC"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
