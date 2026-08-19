import {ClerkProvider} from "@clerk/nextjs";
import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages, getTranslations} from "next-intl/server";
import type {Metadata, Viewport} from "next";
import {ThemeProvider} from "@/components/providers/theme-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("App");

  return {
    title: {
      default: "Verba",
      template: "%s · Verba"
    },
    applicationName: "Verba",
    appleWebApp: {
      capable: true,
      title: "Verba",
      statusBarStyle: "default"
    },
    description: t("description"),
    icons: {
      icon: [
        {url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png"},
        {url: "/icons/icon-192.png", sizes: "192x192", type: "image/png"}
      ],
      apple: [{url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png"}]
    },
    manifest: "/manifest.webmanifest"
  };
}

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
