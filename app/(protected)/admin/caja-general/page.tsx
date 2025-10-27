import { 
    getCajaGeneralActiva, 
    getResumenCajaGeneral, 
    getCortesUsuarios,
    getMovimientosCajaGeneral 
} from "@/actions/CajaGeneralActions";
import { CajaGeneralClient } from "@/components/admin/caja-general/CajaGeneralClient";
import { currentUser } from "@/lib/auth";

export default async function CajaGeneralPage() {
    const user = await currentUser();

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener información del usuario actual</h4>
            </div>
        );
    }

    const [cajaGeneral, resumen, cortes, movimientos] = await Promise.all([
        getCajaGeneralActiva(),
        getResumenCajaGeneral(1), // ID mock
        getCortesUsuarios(),
        getMovimientosCajaGeneral(1) // ID mock
    ]);

    if (!cajaGeneral || !resumen || !cortes || !movimientos) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener datos de caja general</h4>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <CajaGeneralClient 
                cajaGeneral={cajaGeneral}
                resumenInicial={resumen}
                cortesUsuarios={cortes}
                movimientosIniciales={movimientos}
                usuarioId={user.usuario.UsuarioID}
            />
        </div>
    );
}
