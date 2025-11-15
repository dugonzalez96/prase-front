import { 
    getCajaGeneralActiva, 
    getResumenCajaGeneral, 
    getCortesUsuarios
} from "@/actions/CajaGeneralActions";
import { getMovimientos } from "@/actions/MovimientosActions";
import { CajaGeneralPage } from "@/components/admin/caja-general/CajaGeneralPage";
import { currentUser } from "@/lib/auth";

export default async function CajaGeneralPageServer() {
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
        getResumenCajaGeneral(1),
        getCortesUsuarios(),
        getMovimientos()
    ]);

    if (!cajaGeneral || !resumen || !cortes) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener datos de caja general</h4>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <CajaGeneralPage 
                cajaGeneral={cajaGeneral}
                resumenInicial={resumen}
                cortesUsuarios={cortes}
                movimientosIniciales={movimientos || []}
                usuarioId={user.usuario.UsuarioID}
            />
        </div>
    );
}
