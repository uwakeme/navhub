import { Suspense } from "react"
import { Link } from "@/i18n/routing"
import { UserNav } from "./user-nav"
import { Search } from "./search"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"
import { useTranslations } from "next-intl"

export function Header() {
  const t = useTranslations("Common")

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="flex h-16 items-center px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold text-xl mr-6 group select-none"
        >
          <span className="inline-block w-7 h-7 border-2 border-foreground bg-foreground text-background flex items-center justify-center text-sm font-black group-hover:bg-accent group-hover:border-accent group-hover:text-accent-foreground transition-colors">
            N
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-foreground tracking-tight">{t("navHub")}</span>
            <span className="text-accent font-mono animate-pulse">_</span>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto px-4">
          <Suspense fallback={
            <div className="w-full max-w-sm h-9 border border-border bg-background animate-pulse" />
          }>
            <Search />
          </Suspense>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <div className="h-6 w-px bg-border" />
          <LanguageSwitcher />
          <div className="h-6 w-px bg-border" />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
