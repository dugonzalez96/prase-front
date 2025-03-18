"use client";

import { getInicioActivo } from "@/actions/MovimientosActions";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { iGetInicioActivo } from "@/interfaces/MovimientosInterface";
import { cn } from "@/lib/utils";
import { Aplicaciones } from "@/next-auth";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bolt,
  BookOpenCheck,
  Building,
  Car,
  ChevronDown,
  Coins,
  FileCheck,
  FileText,
  Gauge,
  Home,
  Landmark,
  List,
  LockKeyhole,
  LucideIcon,
  Menu,
  Merge,
  PercentSquare,
  Plus,
  Receipt,
  Scale,
  ScrollText,
  Shield,
  ShieldCheck,
  Truck,
  User,
  User2,
  UserCog,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OpcionesCaja } from "./admin/movimientos/OpcionesCaja";
import UserDropdown from "./UserDropdown";

interface SidebarProps {
  UsuarioID: number;
  NombreUsuario: string;
  aplicaciones: Aplicaciones[];
  user: any;
}

const iconosDisponibles: Record<string, LucideIcon> = {
  Home,
  FileText,
  List,
  Shield,
  LockKeyhole,
  User2,
  Merge,
  Scale,
  Bolt,
  BookOpenCheck,
  Car,
  User,
  Plus,
  FileCheck,
  Receipt,
  UserCog,
  Gauge,
  UserPlus,
  Building,
  ScrollText,
  ShieldCheck,
  Coins,
  Truck,
  Wallet,
  PercentSquare,
  Landmark,
};

export default function Sidebar({ UsuarioID, NombreUsuario, aplicaciones, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  // const user = useCurrentUser();
  const [categoriaAbierta, setCategoriaAbierta] = useState<string | null>(null);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [inicioCajaActivo, setInicioCajaActivo] = useState<iGetInicioActivo | null>(null);
  const [modalInicioCajaAbierto, setModalInicioCajaAbierto] = useState(false);
  const [modalCorteAbierto, setModalCorteAbierto] = useState(false);

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      router.refresh();
    }
  }, [status, router]);

  useEffect(() => {
    const obtenerInicioCaja = async () => {
      if (UsuarioID) {

        const respuesta = await getInicioActivo(UsuarioID);

        if (respuesta && !('statusCode' in respuesta)) {
          setInicioCajaActivo(respuesta);
        }
      }
    };

    obtenerInicioCaja();
  }, []);


  const aplicacionesPorCategoria = aplicaciones.reduce((acc, app) => {
    if (!acc[app.categoria]) {
      acc[app.categoria] = [];
    }
    acc[app.categoria].push(app);
    return acc;
  }, {} as Record<string, Aplicaciones[]>);

  const obtenerIcono = (nombreIcono: string | null): LucideIcon => {
    if (!nombreIcono) return FileText;
    return iconosDisponibles[nombreIcono] || FileText;
  };

  const alternarMenu = (categoria: string) => {
    setCategoriaAbierta(categoriaAbierta === categoria ? null : categoria);
  };


  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 xl:hidden"
        onClick={() => setSidebarAbierta(!sidebarAbierta)}
      >
        {sidebarAbierta ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out xl:translate-x-0",
        sidebarAbierta ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-center h-16 px-4 mt-8">
            <Link href="/">
              <Image
                src="/prase-logo.png"
                width={100}
                height={100}
                alt="Prase logo"
                priority={true}
              />
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 mt-8">
            <Link href="/" passHref>
              <Button
                variant={pathname === "/" ? "link" : "ghost"}
                className="w-full justify-start mb-4"
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>

            {Object.entries(aplicacionesPorCategoria).map(([categoria, apps]) => (
              <div key={categoria} className="mb-4">
                <Button
                  variant={apps.some((app) => pathname.includes(app.descripcion)) ? "link" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => alternarMenu(categoria)}
                >
                  <span className="flex items-center">
                    {categoria === "Administración" ? (
                      <Shield className="mr-2 h-4 w-4" />
                    )
                      : categoria === 'Recursos Humanos'
                        ? (
                          <UserCog className="mr-2 h-4 w-4" />
                        )
                        : categoria === 'Cotizaciones'
                          ? (
                            <Receipt className="mr-2 h-4 w-4" />
                          )
                          : (
                            <FileText className="mr-2 h-4 w-4" />
                          )}
                    {categoria}
                  </span>
                  <motion.div
                    animate={{ rotate: categoriaAbierta === categoria ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>

                <AnimatePresence>
                  {categoriaAbierta === categoria && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-2 space-y-2">
                        {apps.map((app) => {
                          const IconoApp = obtenerIcono(app.icon);
                          return (
                            <motion.div
                              key={app.aplicacionId}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link href={app.descripcion} passHref>
                                <Button
                                  variant={pathname === app.descripcion ? "link" : "ghost"}
                                  className="w-full justify-start text-sm"
                                  onClick={() => setSidebarAbierta(false)}
                                >
                                  <IconoApp className="mr-2 h-3 w-3" />
                                  {app.nombre}
                                </Button>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            ))}

            {UsuarioID
              // && user?.grupo.nombre !== 'Administrador'
              &&
              (
                <OpcionesCaja usuarioId={UsuarioID} NombreUsuario={NombreUsuario} />
              )}
          </nav>

          <div className="mt-auto">
            {user && UsuarioID && (
              <div className="px-4 py-4 border-t">
                <UserDropdown user={user} />
              </div>
            )}
          </div>
        </div>
      </aside>

      {sidebarAbierta && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => setSidebarAbierta(false)}
        />
      )}
    </>
  );
}