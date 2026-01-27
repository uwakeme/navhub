import { Suspense } from "react"
import { Link } from "@/i18n/routing"
import { UserNav } from "./user-nav"
import { Search } from "./search"
import { Compass } from "lucide-react"
import { LanguageSwitcher } from "./language-switcher"
import { useTranslations } from "next-intl"

export function Header() {
  const t = useTranslations("Common")

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
          <Compass className="h-6 w-6" />
          <span>{t("navHub")}</span>
        </Link>
        <div className="flex-1 flex justify-center max-w-2xl mx-auto px-4">
           <Suspense fallback={<div className="w-full max-w-sm h-10 bg-muted animate-pulse rounded-md" />}>
             <Search />
           </Suspense>
        </div>
        <div className="ml-auto flex items-center space-x-2">
           <LanguageSwitcher />
           <UserNav />
        </div>
      </div>
    </header>
  )
}
