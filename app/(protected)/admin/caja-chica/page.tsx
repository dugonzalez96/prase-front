import { getCajaChicaActiva, getMovimientosCajaChica, getResumenCajaChica } from "@/actions/CajaChicaActions";
import { CajaChicaClient } from "@/components/admin/caja-chica/CajaChicaClient";
import { currentUser } from "@/lib/auth";

export default async function CajaChicaPage() {
    const user = await currentUser();

    console.log("🚀 ~ CajaChicaPage ~ user:", user)
    if (!user) {

        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener información del usuario actual</h4>
            </div>
        );
    }

    const [cajaChica, movimientos, resumen] = await Promise.all([
        getCajaChicaActiva(user.usuario.UsuarioID),
        getMovimientosCajaChica(1), // ID de caja chica mock
        getResumenCajaChica(1)
    ]);

    if (!cajaChica || !movimientos || !resumen) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener datos de caja chica</h4>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <CajaChicaClient 
                cajaChica={cajaChica}
                movimientosIniciales={movimientos}
                resumenInicial={resumen}
                usuarioId={user.usuario.UsuarioID}
            />
        </div>
    );
}
