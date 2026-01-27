'use client'

import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import { useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useTranslations } from "next-intl"

export function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations("Common")

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
        placeholder={t("searchPlaceholder")}
        className="pl-8 w-full"
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
