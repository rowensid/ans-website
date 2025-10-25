import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A&S Studio Project - Creative Studio & Premium Hosting Services",
  description: "Creative studio & premium hosting services untuk kebutuhan digital anda. Game hosting premium, RDP berkualitas, dan jasa development profesional dengan sentuhan artistik yang unik.",
  keywords: ["A&S Studio", "Game Hosting", "RDP Premium", "Development Services", "FiveM", "Roblox", "Creative Studio", "Premium Hosting"],
  authors: [{ name: "A&S Studio Project" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "A&S Studio",
    startupImage: [
      {
        url: "/splash-1334x750.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  openGraph: {
    title: "A&S Studio Project - Creative Studio & Premium Hosting Services",
    description: "Solusi kreatif untuk kebutuhan digital anda. Game hosting premium, RDP berkualitas, dan jasa development profesional.",
    url: "https://as-studio-project.com",
    siteName: "A&S Studio Project",
    type: "website",
    images: [
      {
        url: "/logo-as-studio.png",
        width: 1200,
        height: 630,
        alt: "A&S Studio Project Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A&S Studio Project - Creative Studio & Premium Hosting Services",
    description: "Solusi kreatif untuk kebutuhan digital anda. Game hosting premium, RDP berkualitas, dan jasa development profesional.",
    images: ["/logo-as-studio.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "A&S Studio",
    "application-name": "A&S Studio",
    "msapplication-TileColor": "#7c3aed",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
