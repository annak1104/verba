import {ClerkProvider} from "@clerk/nextjs";
import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages} from "next-intl/server";
import type {Metadata, Viewport} from "next";
import {ThemeProvider} from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaDeck",
  description: "A mobile-first English vocabulary learning app."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    {media: "(prefers-color-scheme: light)", color: "#f9f7f0"},
    {media: "(prefers-color-scheme: dark)", color: "#171b24"}
  ]
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <body>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
