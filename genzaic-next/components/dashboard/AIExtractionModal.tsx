"use client"

import { useState } from "react"
import { useParseProductTextMutation } from "@/store/api/aiApi"
import { toast } from "sonner"
import { Sparkles, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AIExtractionModalProps {
  open: boolean
  onClose: () => void
  onExtract: (data: { title: string; description: string; price?: number; originalPrice?: number }) => void
}

export function AIExtractionModal({ open, onClose, onExtract }: AIExtractionModalProps) {
  const [text, setText] = useState("")
  const [parseProductText, { isLoading }] = useParseProductTextMutation()

  const handleExtract = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to extract from")
      return
    }
    try {
      const result = await parseProductText({ text }).unwrap()
      if (result.products.length > 0) {
        const product = result.products[0]
        onExtract({
          title: product.title,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
        })
        toast.success(`Extracted ${result.count} product${result.count > 1 ? "s" : ""}`)
        setText("")
      } else {
        toast.error("No product details found in the text")
      }
    } catch {
      toast.error("AI extraction failed. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Product Extraction
          </DialogTitle>
          <DialogDescription>
            Paste your product description and let AI extract the details automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Product Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your product info here — e.g. from a social media post, email, or product page..."
              className="min-h-[160px]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleExtract}
              disabled={isLoading || !text.trim()}
              className="gradient-primary text-white gap-2"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Extracting...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Extract</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
