'use client'

import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"

export function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.replace(`/?${params.toString()}`)
    })
  }, 300)

  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search websites..."
        className="pl-8 w-full"
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
