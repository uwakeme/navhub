'use client'

import { Input } from "@/components/ui/input"
import { SearchIcon, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import { useTransition, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useTranslations } from "next-intl"

export function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isFocused, setIsFocused] = useState(false)
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
    <div className="relative w-full max-w-md group">
      <div className="relative">
        <SearchIcon
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-150 ${
            isFocused ? 'text-accent' : 'text-muted-foreground'
          }`}
        />

        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent animate-spin" />
        )}

        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          className={`pl-10 pr-10 w-full bg-background border-border text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:bg-background focus:ring-1 focus:ring-accent rounded-none font-mono transition-colors ${
            isFocused ? 'border-accent' : ''
          }`}
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] font-mono text-muted-foreground pointer-events-none uppercase tracking-wider">
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "⌘K"}
        </span>
      </div>
    </div>
  )
}
