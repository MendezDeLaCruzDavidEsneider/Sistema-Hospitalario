/**
 * @file src/app/layout.tsx
 *
 * @description Root Layout de la aplicacion.
 * Se renderiza UNA vez para toda la aplicacion.
 * Incluye: metadata SEO, fuentes, providers globales.
 */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

// Carga la fuente Geist de Google Fonts de forma optimizada
const geist = Geist({ subsets: ["latin"] });

// Metadata del sitio (afecta al SEO)
export const metadata: Metadata = {
  title: {
    template: "%s | Sistema Hospitalario",
    default: "Sistema de Gestion Hospitalaria — SENA CEET",
  },
  description: "Sistema de gestion hospitalaria para el programa ADSO del SENA CEET",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={geist.className}>
        {/* Proveedor de notificaciones toast globales */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            success: { style: { background: "#E8F5E9", color: "#1E7A2A" } },
            error:   { style: { background: "#FFEBEE", color: "#C62828" } },
          }}
        />
        {children}
      </body>
    </html>
  );
}