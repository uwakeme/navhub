import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

// Helper to get icon by name safely
export function getIcon(name: string | null): LucideIcon {
  if (!name) return Icons.Hash
  // @ts-expect-error - dynamic icon access
  return Icons[name] as LucideIcon || Icons.Hash
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  order: number
}