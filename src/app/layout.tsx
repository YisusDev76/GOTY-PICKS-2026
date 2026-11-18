import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";

const archivo = Archivo_Black({ variable: "--font-archivo", subsets: ["latin"], weight: "400" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// URL pública del sitio: Vercel la expone sola en producción. Sirve para que
// los links compartidos (WhatsApp, X, etc.) muestren la imagen de vista previa.
const sitio = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: "GOTY Picks 2026",
  description:
    "Arma tus predicciones de The Game Awards 2026: ❤️ quién quieres que gane y 💰 por quién apostarías. Exporta tu boleta para Instagram.",
};

export const viewport: Viewport = {
  themeColor: "#0b0a12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${archivo.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto px-4 pb-28 pt-10 text-center text-xs text-tenue">
          Proyecto de fans, sin relación oficial con The Game Awards. Los nombres de juegos pertenecen a
          sus dueños.
        </footer>
      </body>
    </html>
  );
}
