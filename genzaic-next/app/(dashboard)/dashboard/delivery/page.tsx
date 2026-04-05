"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, MessageSquare, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const deliveryTypes = [
  {
    type: "download",
    label: "File Download",
    icon: Download,
    description: "Buyers receive a secure download link after purchase. Files are hosted on ImageKit CDN.",
    features: ["Secure download links", "Download limit controls", "Auto-delivery on purchase", "Download analytics"],
    status: "active",
  },
  {
    type: "external_link",
    label: "External Link",
    icon: ExternalLink,
    description: "Redirect buyers to an external URL (Notion page, Google Drive, Gumroad, etc.)",
    features: ["Instant access", "Works with any URL", "No storage limits", "Easy to update"],
    status: "active",
  },
  {
    type: "manual",
    label: "Manual Delivery",
    icon: MessageSquare,
    description: "Buyers receive your contact details to claim the product. Best for services and custom work.",
    features: ["Email notification", "WhatsApp support", "Phone delivery", "Flexible fulfillment"],
    status: "active",
  },
]

export default function DeliveryPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Delivery Settings</h1>
        <p className="text-muted-foreground mt-1">Understand how product delivery works on GenZaic</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Delivery type is configured per-product. Go to <strong>Products → Edit</strong> to change the delivery method for each product.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {deliveryTypes.map((item) => (
          <Card key={item.type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </div>
                <Badge variant="success">Available</Badge>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-2 gap-2">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
