import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { env } from "@/lib/env";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Empowerme Community · Experiencias y programas de bienestar", template: "%s · Empowerme" },
  description:
    "Clases, talleres, carreras y retos corporativos de bienestar integral en Guadalajara. Transformamos vidas, empresas y comunidades.",
  openGraph: { type: "website", locale: "es_MX", siteName: "Empowerme Community" },
};

export const viewport: Viewport = { themeColor: "#d1432d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${archivo.variable} ${instrument.variable}`}>
      <body className="min-h-dvh">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
