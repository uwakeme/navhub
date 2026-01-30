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
        <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
          isFocused ? 'text-slate-600' : 'text-slate-400 dark:text-slate-500'
        }`} />

        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 animate-spin" />
        )}

        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          className="pl-10 pr-10 w-full bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-500/50 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500/20 rounded-lg transition-all duration-200"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  )
}
