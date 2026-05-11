"use client"

import { useState } from "react"
import { useKyc } from "@/lib/queries/kyc"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { KycWizard } from "./KycWizard"
import { KycStatusView } from "./KycStatusView"
import { KycSectionEdit, type EditSection } from "./KycSectionEdit"

/**
 * Top-level KYC panel. Branches between three views:
 *
 *   - Wizard         — first-time submission. Walks the seller through all
 *                      three steps in sequence.
 *   - Status view    — read-only summary + horizontal progress bar. Shown
 *                      whenever a kyc record exists. Replaces the form
 *                      after submission so the seller doesn't see the
 *                      wizard once they've submitted.
 *   - Section edit   — focused single-section form. Reached from the
 *                      status view's "Fix & resubmit" callouts when the
 *                      record is rejected. Avoids the full wizard for
 *                      narrow fixes (e.g. just editing the UPI handle).
 */
export function KycPanel() {
  const { data: kyc, isLoading } = useKyc()
  const [editSection, setEditSection] = useState<EditSection | null>(null)

  if (isLoading) {
    return <GenzaicLoader.Page label="Loading your KYC" />
  }

  // First-time submission — no record yet → full wizard.
  if (!kyc) {
    return <KycWizard existing={null} />
  }

  // Targeted edit on a rejected record. The seller picked which section
  // to fix from the status view's callouts.
  if (editSection && kyc.verificationStatus === "rejected") {
    return (
      <KycSectionEdit
        existing={kyc}
        section={editSection}
        onCancel={() => setEditSection(null)}
      />
    )
  }

  // Default: status view (pending / verified / rejected).
  return (
    <KycStatusView
      kyc={kyc}
      onEditSection={(section) => setEditSection(section)}
    />
  )
}
