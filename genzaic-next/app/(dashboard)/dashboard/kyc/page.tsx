import { Suspense } from "react"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { KycPanel } from "@/components/dashboard/kyc/KycPanel"

export default function KYCPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<GenzaicLoader.Page label="Loading your KYC" />}>
        <KycPanel />
      </Suspense>
    </div>
  )
}
