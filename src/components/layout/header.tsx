import { Suspense } from "react"
import { Link } from "@/i18n/routing"
import { UserNav } from "./user-nav"
import { Search } from "./search"
import { Sparkles } from "lucide-react"
import { LanguageSwitcher } from "./language-switcher"
import { ThemeToggle } from "./theme-toggle"
import { useTranslations } from "next-intl"
import Image from "next/image"

export function Header() {
  const t = useTranslations("Common")

  return (
    <header className="border-b border-slate-700/50 sticky top-0 bg-background/80 backdrop-blur-xl z-50">
      <div className="flex h-16 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl mr-6 group">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-500/30 blur-lg rounded-full group-hover:bg-slate-500/50 transition-all duration-300" />
            <Image 
              src="/logo.svg" 
              alt="NavHub Logo" 
              width={40} 
              height={40} 
              className="relative z-10 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="gradient-text">{t("navHub")}</span>
            <Sparkles className="h-3.5 w-3.5 text-slate-400/70" />
          </div>
        </Link>
        
        {/* Search */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto px-4">
           <Suspense fallback={
             <div className="w-full max-w-sm h-10 bg-muted animate-pulse rounded-lg border border-border" />
           }>
             <Search />
           </Suspense>
        </div>
        
        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
           <ThemeToggle />
           <div className="h-6 w-px bg-slate-700/50 dark:bg-slate-700/50 bg-slate-300" />
           <LanguageSwitcher />
           <div className="h-6 w-px bg-slate-700/50 dark:bg-slate-700/50 bg-slate-300" />
           <UserNav />
        </div>
      </div>
    </header>
  )
}
