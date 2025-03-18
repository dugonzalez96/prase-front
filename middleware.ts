import NextAuth from "next-auth";

import authConfig from "./auth.config";
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT } from "./routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  // Verificar si es una ruta pública
  const isAuthRoute = authRoutes.some((route) => {
    if (route instanceof RegExp) {
      return route.test(nextUrl.pathname);
    }
    return route === nextUrl.pathname;
  });

  // Permitir las rutas de API de autenticación
  if (isApiAuthRoute) {
    return;
  }

  // Redirigir si ya está autenticado en rutas de login
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // Redirigir a login si no está autenticado
  if (!isLoggedIn) {
    return Response.redirect(new URL(`/login`, nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
