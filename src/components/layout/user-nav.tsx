'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signIn, signOut, useSession } from "next-auth/react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

export function UserNav() {
  const { data: session } = useSession()
  const tCommon = useTranslations("Common")
  const tNav = useTranslations("Navigation")

  if (!session?.user) {
    return (
      <Button
        variant="default"
        onClick={() => signIn("github")}
        className="font-mono text-xs uppercase tracking-widest h-9 px-4"
      >
        {tCommon("signIn")}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 border-2 border-border hover:border-accent p-0 rounded-none"
        >
          <Avatar className="h-full w-full">
            <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
            <AvatarFallback className="rounded-none font-bold">
              {session.user.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none font-mono">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground font-mono">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {session.user.role === 'ADMIN' && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="font-mono text-xs uppercase tracking-widest">
                <span className="text-accent">▸</span>
                {tNav("admin")}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {session.user.role === 'ADMIN' && <DropdownMenuSeparator />}
        <DropdownMenuItem
          onClick={() => signOut()}
          className="font-mono text-xs uppercase tracking-widest"
        >
          {tCommon("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
