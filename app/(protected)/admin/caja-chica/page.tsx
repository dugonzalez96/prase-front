import { getPrecuadreCajaChica } from "@/actions/CajaChicaActions";
import { getCuentasBancarias } from "@/actions/ClientesActions";
import { getUsuarios } from "@/actions/SeguridadActions";
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

    // Obtener datos necesarios para el componente
    const precuadre = await getPrecuadreCajaChica();
    const usuarios = await getUsuarios() || [];
    const cuentasBancarias = await getCuentasBancarias() || [];

    return (
        <div className="container mx-auto py-8">
            <CajaChicaClient 
                precuadreInicial={'error' in precuadre ? undefined : precuadre}
                usuarioId={user.usuario.UsuarioID}
                usuarios={usuarios}
                cuentasBancarias={cuentasBancarias}
            />
        </div>
    );
}
