# AGENTS.md - NavHub Development Guide

> Navigation homepage for discovering and organizing developer tools.
> Next.js 16+ | TypeScript | Tailwind CSS v4 | Prisma | NextAuth.js v5

## Quick Reference

### Commands

```bash
# Development
npm run dev           # Start dev server at localhost:3000
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
npx prisma migrate dev          # Apply migrations (dev)
npx prisma migrate reset --force && npm run db:seed  # Reset + seed
npm run db:seed                 # Seed database only
npx prisma studio               # Open Prisma Studio GUI
npx prisma generate             # Regenerate Prisma client

# Utilities
npx tsx scripts/promote-admin.ts <email>  # Promote user to admin
```

### No Testing Framework

This project currently has no test files or testing framework configured.
If adding tests, consider: Vitest + React Testing Library + Playwright.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n routes (en, zh)
│   │   ├── layout.tsx      # Root layout with providers
│   │   ├── page.tsx        # Homepage
│   │   ├── admin/          # Admin dashboard (ADMIN role required)
│   │   ├── auth/           # Auth pages (signin)
│   │   ├── favorites/      # User favorites page
│   │   └── submit/         # Website submission form
│   └── api/                # API routes
│       ├── admin/          # Admin-only endpoints
│       ├── auth/           # NextAuth handlers
│       ├── favorites/      # Favorites CRUD
│       └── websites/       # Website submission
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Header, Sidebar, UserNav, Search
│   └── *.tsx               # Feature components
├── generated/
│   └── client/             # Prisma generated client (DO NOT EDIT)
├── i18n/                   # next-intl config
├── lib/                    # Utilities (auth, prisma, utils)
└── types/                  # TypeScript declarations
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed script
```

---

## Code Style Guidelines

### Imports (Order)

```tsx
// 1. React/Next.js core
import { Suspense } from "react"
import { Metadata } from "next"

// 2. Third-party libraries
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 3. Internal absolute imports (@/*)
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Website } from "@/generated/client"

// 4. Relative imports (rare, prefer @/ paths)
import { cn } from "@/lib/utils"
```

**Path Alias**: Always use `@/*` instead of relative paths (`../`).

### TypeScript

- **Strict mode enabled** - no implicit any
- **Never suppress errors**: No `as any`, `@ts-ignore`, `@ts-expect-error`
- **Prefer type inference** over explicit annotations when obvious
- **Interface for props**: Define explicit interfaces for component props

```tsx
interface WebsiteCardProps {
  website: Website
  isFavorited?: boolean
}
```

- **Import types from Prisma client**: `import { Website, Role, Prisma } from "@/generated/client"`

### React Components

```tsx
// Client components: Add directive at top
'use client'

// Server components: Default (no directive needed)

// Function declaration style (not arrow):
export function ComponentName({ prop }: Props) {
  return (...)
}

// Or for UI primitives with refs:
function Button({ className, ...props }: ButtonProps) {
  return <button className={cn("...", className)} {...props} />
}
export { Button }
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `WebsiteCard`, `UserNav` |
| Files (components) | kebab-case | `website-card.tsx`, `user-nav.tsx` |
| Files (pages) | `page.tsx`, `layout.tsx` | Next.js conventions |
| Functions | camelCase | `toggleFavorite`, `onSubmit` |
| Constants | camelCase or UPPER_SNAKE | `formSchema`, `DEFAULT_LOCALE` |
| Types/Interfaces | PascalCase | `WebsiteCardProps`, `PageProps` |
| API routes | REST conventions | `GET`, `POST`, `PATCH`, `DELETE` |

### Styling (Tailwind CSS v4 + shadcn/ui)

- **Use `cn()` utility** for conditional classes:
  ```tsx
  import { cn } from "@/lib/utils"
  className={cn("base-classes", condition && "conditional-class", className)}
  ```
- **Tailwind only** - no inline styles, no CSS modules
- **shadcn/ui components**: Located in `src/components/ui/`
- **Lucide icons**: `import { IconName } from "lucide-react"`
- **CVA for variants**: Use `class-variance-authority` for component variants

### Forms & Validation

```tsx
// Zod schema definition
const formSchema = z.object({
  title: z.string().min(2, { message: "..." }),
  url: z.string().url({ message: "..." }),
})

// React Hook Form + Zod
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... },
})
```

### Error Handling

```tsx
// API routes - return appropriate status codes
if (!session?.user?.id) {
  return new NextResponse("Unauthorized", { status: 401 })
}

// Client components - use toast notifications
import { toast } from "sonner"
toast.error("Something went wrong")
toast.success("Operation successful!")

// Try-catch with proper error handling
try {
  // operation
} catch (error) {
  console.error(error)  // Log for debugging
  return new NextResponse("Internal Error", { status: 500 })
}
```

---

## Key Patterns

### Authentication

```tsx
// Server-side: Get session
import { auth } from "@/lib/auth"
const session = await auth()

// Check auth
if (!session?.user?.id) { /* unauthorized */ }

// Check admin role
if (session?.user?.role !== 'ADMIN') { /* forbidden */ }

// Client-side: useSession hook
import { useSession } from "next-auth/react"
const { data: session } = useSession()
```

### Database (Prisma)

```tsx
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/client"

// Queries with type-safe where clauses
const where: Prisma.WebsiteWhereInput = { status: 'APPROVED' }
const websites = await prisma.website.findMany({ where, include: { category: true } })
```

**After schema changes:**
```bash
npx prisma migrate dev --name description
npx prisma generate
```

### Internationalization (next-intl)

- **Locales**: `en`, `zh` (defined in `src/i18n/routing.ts`)
- **Translation files**: `messages/en.json`, `messages/zh.json`
- **Server components**: `import { useTranslations } from "next-intl"`
- **Navigation**: Use `Link` from `@/i18n/routing` instead of `next/link`

### Page Props (App Router)

```tsx
// Next.js 15+ async params/searchParams
interface PageProps {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  // ...
}
```

---

## API Route Patterns

```tsx
// src/app/api/[resource]/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    // Validate & process
    const result = await prisma.model.create({ data: {...} })
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// Dynamic routes: src/app/api/[resource]/[id]/route.ts
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  // Use params.id
}
```

---

## Environment Variables

Required in `.env`:
```
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="..."           # openssl rand -base64 32
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
```

---

## Common Gotchas

1. **Prisma client location**: Generated to `src/generated/client`, NOT `node_modules`
2. **App Router async**: `params` and `searchParams` are Promises in Next.js 15+
3. **Client vs Server**: Add `'use client'` only when using hooks, event handlers, browser APIs
4. **i18n routing**: Use `Link` from `@/i18n/routing`, not `next/link`
5. **Auth session**: `auth()` for server, `useSession()` for client
6. **Type imports**: Import Prisma types from `@/generated/client`
