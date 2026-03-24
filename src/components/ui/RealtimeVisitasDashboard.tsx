/**
 * @file src/components/ui/RealtimeVisitasDashboard.tsx
 *
 * @description Dashboard de visitas con actualizacion en tiempo real.
 *
 * Implementa el Observer Pattern usando Supabase Realtime:
 * - Supabase PostgREST actua como el "Subject" (observable)
 * - Este componente actua como el "Observer" (suscriptor)
 * - Cuando hay un INSERT/UPDATE/DELETE en "visitas", Supabase
 *   notifica a todos los suscriptores via WebSocket
 *
 * @pattern Observer Pattern
 * @directive "use client" - necesita WebSocket (solo en el browser)
 */

"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { VisitaCompleta } from "@/modules/visitas/types";

interface Props {
  // Datos iniciales del servidor (SSR)
  initialVisitas: VisitaCompleta[];
}

export function RealtimeVisitasDashboard({ initialVisitas }: Props) {
  // Estado local: inicia con los datos del servidor
  const [visitas, setVisitas] = useState<VisitaCompleta[]>(initialVisitas);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Suscribirse al canal de cambios de la tabla visitas
    const channel = supabase
      .channel("dashboard.visitas") // Nombre unico del canal
      .on(
        "postgres_changes",         // Tipo: cambios en PostgreSQL
        {
          event: "INSERT",          // Solo inserciones nuevas
          schema: "public",
          table: "visitas",
        },
        (payload) => {
          // payload.new contiene el nuevo registro insertado
          console.log("Nueva visita registrada:", payload.new);

          // Agregar la nueva visita al inicio de la lista
          // (estado inmutable: no mutar directamente)
          setVisitas((prev) => [
            payload.new as VisitaCompleta,
            ...prev.slice(0, 9), // Mantener maximo 10 visitas
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "visitas" },
        (payload) => {
          // Eliminar la visita del estado local
          setVisitas((prev) =>
            prev.filter((v) => v.visitaId !== payload.old.visitaid)
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    // CLEANUP: muy importante cancelar la suscripcion al desmontar
    // Sin esto, habria memory leaks y suscripciones duplicadas
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // [] = ejecutar solo una vez al montar el componente

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Indicador de conexion Realtime */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Visitas Recientes
        </h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
            } transition-colors`}
          />
          <span className="text-xs text-gray-500">
            {isConnected ? "En tiempo real" : "Conectando..."}
          </span>
        </div>
      </div>

      {/* Lista de visitas */}
      <div className="space-y-3">
        {visitas.map((visita, index) => (
          <div
            key={visita.visitaId || index}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {typeof visita.paciente === "object"
                  ? `${visita.paciente?.nombre} ${visita.paciente?.apellido}`
                  : "Cargando..."}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Dr. {typeof visita.medico === "object"
                  ? visita.medico?.nombre
                  : "..."}{" "}
                {visita.medico?.apellido}
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {visita.fecha}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}