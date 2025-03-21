import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "./auth.config";
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT } from "./routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  // Permitir las rutas de API de autenticación
  if (isApiAuthRoute) {
    return NextResponse.next(); // ✅ Corrección: Ahora usa NextResponse
  }

  // Verificar si la ruta es pública (login, register, etc.)
  const isAuthRoute = authRoutes.some((route) => {
    if (route instanceof RegExp) {
      return route.test(nextUrl.pathname);
    }
    return route === nextUrl.pathname;
  });

  // 🔹 Si ya está autenticado y visita una página de login, redirigir al dashboard.
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // 🔹 Si no está autenticado y no es una ruta pública, redirigir al login.
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next(); // ✅ Corrección: Permite continuar con la carga normal
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
