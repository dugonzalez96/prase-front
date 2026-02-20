import { getPrecuadreCajaChicaXSucursal } from "@/actions/CajaChicaActions";
import { CajaChicaPage } from "@/components/admin/caja-chica/CajaChicaPage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { currentUser } from "@/lib/auth";
import { AlertCircle } from "lucide-react";

export default async function CajaChicaPageServer() {
    const user = await currentUser();
    console.log("🚀 ~ CajaChicaPageServer ~ user:", user)

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error al obtener información del usuario actual
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    // Verificar si el usuario tiene acceso a la sucursal
    if (!user.Sucursal) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No tienes acceso a ninguna sucursal. Contacta al administrador.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Cargar datos iniciales server-side
    const [precuadreResult] = await Promise.all([
        getPrecuadreCajaChicaXSucursal(user.Sucursal.SucursalID),
    ]);

    // Validar precuadre
    const precuadre = "error" in precuadreResult ? undefined : precuadreResult;

    return (
        <div className="container mx-auto py-8">
            <CajaChicaPage
                usuarioId={user.usuario.UsuarioID}
                precuadreInicial={precuadre}
                sucursal={user.Sucursal}
            />
        </div>
    );
}
