import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Shield className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold mb-2">Acceso No Autorizado</h1>
      <p className="text-muted-foreground mb-4">
        No tienes permiso para acceder a esta página.
      </p>
      <Link href="/">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  );
}
