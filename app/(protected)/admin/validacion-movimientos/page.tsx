import { getMovimientosPendientes } from "@/actions/ValidacionMovimientosActions";
import { getPagosPendientes } from "@/actions/PagosPolizaActions";
import { ValidacionConsolidada } from "@/components/admin/validacion-consolidada/ValidacionConsolidada";
import { currentUser } from "@/lib/auth";

export default async function ValidacionMovimientosPage() {
    const [movimientos, pagos, user] = await Promise.all([
        getMovimientosPendientes(),
        getPagosPendientes(),
        currentUser()
    ]);

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener información del usuario actual</h4>
            </div>
        );
    }

    if (!movimientos && !pagos) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener datos pendientes de validación</h4>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <ValidacionConsolidada 
                movimientos={movimientos || []}
                pagos={pagos || []}
                usuarioId={user.usuario.UsuarioID}
            />
        </div>
    );
}
