import { Suspense } from "react"
import { StorefrontEditor } from "@/components/dashboard/StorefrontEditor"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"

export default function StorefrontPage() {
  return (
    <Suspense fallback={<GenzaicLoader.Page label="Curating your store" />}>
      <StorefrontEditor />
    </Suspense>
  )
}
