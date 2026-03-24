/**
 * @file src/lib/supabase/middleware.ts
 * @description Cliente Supabase para el Middleware de Next.js.
 * El middleware se ejecuta en el Edge Runtime ANTES de cada request.
 * Su proposito aqui es refrescar la sesion del usuario.
 */

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Crea el cliente Supabase para el middleware.
 * Recibe request y response para poder leer y escribir cookies.
 *
 * @param request La request de Next.js
 * @param response La response de Next.js
 */
export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}