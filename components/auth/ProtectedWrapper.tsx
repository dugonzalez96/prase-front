"use client";

import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { Aplicaciones } from "@/next-auth";

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  aplicaciones: Aplicaciones[];
}

export const ProtectedRouteWrapper = ({
  children,
  aplicaciones,
}: ProtectedRouteWrapperProps) => {
  const pathname = usePathname();

  const tieneAcceso =
    pathname === "/" ||
    aplicaciones.some((app) => app.descripcion === pathname && app.ingresar);

  if (!tieneAcceso) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
};
