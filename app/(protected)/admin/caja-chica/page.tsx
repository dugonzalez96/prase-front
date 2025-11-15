import { getPrecuadreCajaChica } from "@/actions/CajaChicaActions";
import { getMovimientos } from "@/actions/MovimientosActions";
import { CajaChicaPage } from "@/components/admin/caja-chica/CajaChicaPage";
import { currentUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function CajaChicaPageServer() {
    const user = await currentUser();

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

    // Cargar datos iniciales server-side
    const [precuadreResult] = await Promise.all([
        getPrecuadreCajaChica(),
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
