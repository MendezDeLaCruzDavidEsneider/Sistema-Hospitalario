/**
 * @file middleware.ts (RAIZ del proyecto, junto a package.json)
 *
 * @description Middleware global de autenticacion.
 *
 * Responsabilidades (SRP aplicado):
 *  1. Refrescar el token de sesion de Supabase en cada request.
 *  2. Proteger rutas del dashboard que requieren autenticacion.
 *  3. Redirigir usuarios no autenticados al login.
 *  4. Redirigir usuarios autenticados fuera del login.
 *
 * @principle SRP: este middleware hace SOLO gestion de sesion/auth
 */

import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

// Rutas que NO requieren autenticacion
const PUBLIC_PATHS = [
  "/login",
  "/registro",
  "/",  // Pagina de inicio publica
];

export async function middleware(request: NextRequest) {
  // Crear response base que pasara por el middleware
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Crear cliente Supabase para el middleware
  const supabase = createMiddlewareSupabaseClient(request, response);

  // PASO CRITICO: Refrescar la sesion en cada request.
  // Sin esto, la sesion expira y el usuario es desconectado.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Verificar si la ruta actual es publica
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    pathname === path || pathname.startsWith(path + "/")
  );

  // Si no hay sesion y la ruta es protegida -> redirigir al login
  if (!session && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    // Guardar la URL original para redirigir despues del login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay sesion y el usuario intenta ir al login -> redirigir al dashboard
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continuar con la request normal
  return response;
}

// Configurar en que rutas aplica el middleware
// El patron excluye archivos estaticos y de imagen
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};