'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { Github } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-2 border-foreground rounded-none shadow-none">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 border-2 border-foreground bg-foreground text-background flex items-center justify-center font-mono text-2xl font-black">
              N
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              <span className="text-accent">{'//'}</span> auth.required
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight font-mono">
              sign in
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground font-mono text-xs">
            {'// login to manage your favorites and submit websites'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent h-11 font-mono uppercase tracking-widest text-xs"
            onClick={() => signIn('github', { callbackUrl: '/' })}
          >
            <Github className="mr-2 h-4 w-4" />
            continue with github
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
