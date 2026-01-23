import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnProtected = nextUrl.pathname.startsWith('/favorites') || nextUrl.pathname.startsWith('/submit')
      
      if (isOnAdmin) {
        // We can't check role easily here without JWT custom claims or DB
        // For now, just check if logged in, actual role check happens in Page
        if (isLoggedIn) return true
        return false 
      }
      
      if (isOnProtected) {
        if (isLoggedIn) return true
        return false
      }
      
      return true
    },
  },
} satisfies NextAuthConfig
