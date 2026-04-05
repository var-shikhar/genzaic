import { ProductForm } from "@/components/dashboard/ProductForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Add Product" }

export default function NewProductPage() {
  return <ProductForm mode="create" />
}
