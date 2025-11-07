import { getPrecuadreCajaChica } from "@/actions/CajaChicaActions";
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

    // Obtener precuadre inicial
    const precuadre = await getPrecuadreCajaChica();

    // Si hay error, el componente cliente lo manejará
    // Pasamos el precuadre inicial (si existe) al componente cliente
    return (
        <div className="container mx-auto py-8">
            <CajaChicaClient 
                precuadreInicial={'error' in precuadre ? undefined : precuadre}
            />
        </div>
    );
}
