/**
 * @file src/lib/supabase/server.ts
 * @description Cliente Supabase para Server Components y Server Actions.
 * Usa las cookies de Next.js para mantener la sesion del usuario.
 *
 * @pattern Factory Pattern — centraliza la creacion del cliente
 * @principle SRP — este archivo tiene una sola responsabilidad: crear
 *            el cliente Supabase del lado del servidor
 *
 * IMPORTANTE: Esta funcion es ASYNC porque necesita acceder a las
 * cookies de Next.js, que son asincronas desde Next.js 15.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Crea un cliente Supabase configurado para uso en el servidor.
 * Incluye el manejo automatico de cookies para sesiones.
 *
 * @returns {Promise<SupabaseClient<Database>>} Cliente configurado
 *
 * @example
 * // En un Server Component o Server Action:
 * const supabase = await createServerSupabaseClient();
 * const { data } = await supabase.from("pacientes").select("");
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lee TODAS las cookies de la request actual
        getAll() {
          return cookieStore.getAll();
        },
        // Actualiza las cookies en la response (para refrescar sesion)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components son readonly para cookies.
            // Este error es esperado y puede ignorarse de forma segura.
          }
        },
      },
    }
  );
}