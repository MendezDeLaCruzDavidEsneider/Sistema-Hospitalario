/**
 * @file src/app/(dashboard)/layout.tsx
 *
 * @description Layout para todas las rutas del dashboard.
 * Este layout envuelve todas las paginas dentro del grupo (dashboard).
 * Incluye verificacion de autenticacion, sidebar y header.
 *
 * NOTA: Este archivo es un SERVER COMPONENT.
 * El sidebar y header pueden ser Client Components si necesitan
 * interactividad (como el efecto active de la navegacion).
 */

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layouts/Sidebar";
import { DashHeader } from "@/components/layouts/DashHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticacion en el servidor
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Si no hay sesion, redirigir al login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar de navegacion (fijo en la izquierda) */}
      <Sidebar />

      {/* Area de contenido principal */}
      <div className="flex-col flex-1 overflow-hidden">
        {/* Header del dashboard con info del usuario */}
        <DashHeader userEmail={session.user.email} />

        {/* Contenido de la pagina actual */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}