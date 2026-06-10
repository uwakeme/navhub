"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 border border-border hover:border-accent hover:bg-accent hover:text-accent-foreground transition-colors font-mono text-xs"
        >
          <span className="font-bold tracking-widest">{locale.toUpperCase()}</span>
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLocale("en")}
          className="font-mono text-xs uppercase tracking-widest"
        >
          <span className={locale === "en" ? "text-accent" : ""}>●</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("zh")}
          className="font-mono text-xs uppercase tracking-widest"
        >
          <span className={locale === "zh" ? "text-accent" : ""}>●</span>
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
