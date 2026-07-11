import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SessionManager } from "@/src/features/auth/components/SessionManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nutri Plan",
    template: "%s | Nutri Plan",
  },
  applicationName: "Nutri Plan",
  description:
    "Sistema para criar planos alimentares e acompanhar pacientes de forma simples.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Nutri Plan",
    description:
      "Sistema para criar planos alimentares e acompanhar pacientes de forma simples.",
    siteName: "Nutri Plan",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionManager />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
