'use client'

import { useSearchParams } from "next/navigation"
import { SidebarContent } from "./sidebar-content"
import { Category } from "@/lib/categories"

interface SidebarClientProps {
  categories: Category[]
}

export function SidebarClient({ categories }: SidebarClientProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || undefined
  
  return <SidebarContent categories={categories} currentCategory={currentCategory} />
}