import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { SidebarClient } from "@/components/layout/sidebar-client";
import { Toaster } from "@/components/ui/sonner";
import { BackToTop } from "@/components/back-to-top";
import { DisclaimerModal } from "@/components/disclaimer-modal";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { prisma, executeWithRetry } from "@/lib/prisma";
import { Category } from "@/lib/categories";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NavHub - Developer Navigation",
  description: "Discover the best tools and resources for developers",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  const messages = await getMessages();
  
  // Fetch categories in server component
  let categories: Category[] = [];
  try {
    categories = await executeWithRetry(async () => {
      return await prisma.category.findMany({
        orderBy: { order: 'asc' },
        take: 50,
      });
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <div className="flex flex-1 relative">
              <div className="sticky top-16 h-[calc(100vh-4rem)]">
                <SidebarClient categories={categories} />
              </div>
              <main className="flex-1 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
            <Toaster 
              toastOptions={{
                style: {
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  color: 'var(--popover-foreground)',
                },
              }}
            />
            <BackToTop />
            <DisclaimerModal />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
