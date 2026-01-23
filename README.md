# NavHub

NavHub is a developer navigation homepage where you can discover, share, and organize the best developer tools and resources.

## Features

- **Discover**: Browse curated websites by category (AI, Open Source, Dev Tools, etc.)
- **Search**: Fast search across all resources
- **Submit**: Users can submit new websites for approval
- **Favorites**: Save your favorite tools for quick access
- **Admin Dashboard**: Admins can approve or reject submissions
- **Authentication**: GitHub OAuth integration

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth.js v5 (Beta)
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Type Safety**: TypeScript, Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Copy `.env.example` (or create `.env`) with the following:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-super-secret-key" # Generate with: openssl rand -base64 32
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

4. Initialize the database:

```bash
npx prisma migrate dev
npm run db:seed
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Administrative Access

By default, all users are regular `USER`. To access the Admin Dashboard at `/admin`, you need `ADMIN` role.

To promote a user to admin:
1. Sign in with your GitHub account first (so your user record is created).
2. Run the promotion script:

```bash
npx tsx scripts/promote-admin.ts <your-email>
```

Or manually update the database:
```bash
npx prisma studio
# Find your user and change role from 'USER' to 'ADMIN'
```

## Project Structure

- `src/app`: App Router pages and API routes
- `src/components`: React components (UI, Layout, Features)
- `src/lib`: Utilities (Auth, Prisma, Utils)
- `prisma`: Database schema and seeds
- `scripts`: Helper scripts
