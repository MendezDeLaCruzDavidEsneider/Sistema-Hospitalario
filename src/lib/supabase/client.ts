/**
 * @file src/lib/supabase/client.ts
 * @description Cliente Supabase para Client Components ("use client").
 * Se ejecuta en el navegador del usuario.
 * 
 * IMPORTANTE: Este cliente usa la clave anonima (ANON_KEY) que
 * es segura para exponer en el navegador. Las Row Level Security (RLS)
 * polices de Supabase controlan que datos puede ver cada usuario.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Crea un cliente Supabase para uso en el navegador.
 * Este cliente se usa en componentes marcados con "use client".
 * 
 * @returns {SupabaseClient<Database>} Cliente del navegador
 * 
 * @example
 * "use client";
 * import { createBrowserSupabaseClient } from "@/lib/supabase/client";
 * const supabase = createBrowserSupabaseClient();
 * // Para Realtime:
 * const channel = supabase.channel("visitas").on(...).subscribe();
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}