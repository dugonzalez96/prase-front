import { getPrecuadreCajaChica } from "@/actions/CajaChicaActions";
import { getMovimientos } from "@/actions/MovimientosActions";
import { CajaChicaClient } from "@/components/admin/caja-chica/CajaChicaClient";
import { currentUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function CajaChicaPage() {
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
    const [precuadreResult, movimientosResult] = await Promise.all([
        getPrecuadreCajaChica(),
        getMovimientos(),
    ]);

    // Validar precuadre
    const precuadre = "error" in precuadreResult ? undefined : precuadreResult;
    const movimientos = movimientosResult || [];

    return (
        <div className="container mx-auto py-8">
            <CajaChicaClient 
                usuarioId={user.usuario.UsuarioID}
                precuadreInicial={precuadre}
                movimientosInicial={movimientos}
            />
        </div>
    );
}
