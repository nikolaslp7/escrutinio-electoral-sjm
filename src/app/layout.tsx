import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escrutinio Electoral SJM • Alianza para el Progreso (APP)",
  description:
    "Sistema PWA de escrutinio electoral oficial y control de personería de mesa. Mesa N° 054990 - San Juan de Miraflores (SJM). Generación de Acta A4 y auditoría en tiempo real.",
  keywords: [
    "Escrutinio Electoral",
    "San Juan de Miraflores",
    "Alianza para el Progreso",
    "Dante Mendieta",
    "Mesa 054990",
    "Acta Electoral",
    "PWA",
    "Personero de Mesa",
  ],
  authors: [{ name: "APP SJM Digital Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} dark antialiased`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
