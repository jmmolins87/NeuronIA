import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/lib/env";

import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { ScrollToTop } from "@/components/scroll-to-top";
import { PageLoaderProvider } from "@/components/providers/page-loader-provider";
import { CookieConsentProvider } from "@/components/providers/cookie-consent-provider";
import { AvatarChatGate } from "@/components/avatar-chat-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinvetIA - Automatización Inteligente con IA",
  description: "Descubre cómo la IA puede transformar tu negocio con soluciones automatizadas personalizadas",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <CookieConsentProvider>
              <LenisProvider>
                <KeyboardShortcutsProvider>
                  <PageLoaderProvider>
                     <ScrollToTop />
                     {children}
                     <AvatarChatGate />
                     <KeyboardShortcutsDialog />
                     <Toaster position="top-right" />
                   </PageLoaderProvider>
                 </KeyboardShortcutsProvider>
              </LenisProvider>
            </CookieConsentProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
