import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AssetProvider } from "@/context/AssetContext";
import { ValidationProvider } from "@/context/ValidationContext";
import { DocumentProvider } from "@/context/DocumentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Watu Kobu Management System",
  description: "Debt Collector Management Application - PT. Watu Kobu Multiniaga",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WatuKobu",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        {/* PROVIDER AUTHENTICATION (PENTING: Urutan harus benar) */}
        <SessionProvider>
          <AuthProvider>
            <AssetProvider>
              <ValidationProvider>
                <DocumentProvider>
                  {children}
                </DocumentProvider>
              </ValidationProvider>
            </AssetProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
