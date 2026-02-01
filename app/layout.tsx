import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuronIA - Automatización Inteligente con IA",
  description: "Descubre cómo la IA puede transformar tu negocio con soluciones automatizadas personalizadas",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
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
            <LenisProvider>
              <KeyboardShortcutsProvider>
                {children}
                <KeyboardShortcutsDialog />
              </KeyboardShortcutsProvider>
            </LenisProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
