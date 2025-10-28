import { getMovimientosPendientes } from "@/actions/ValidacionMovimientosActions";
import { ValidacionMovimientosClient } from "@/components/admin/validacion-movimientos/ValidacionMovimientosClient";
import { currentUser } from "@/lib/auth";

export default async function ValidacionMovimientosPage() {
    const [movimientos, user] = await Promise.all([
        getMovimientosPendientes(),
        currentUser()
    ]);

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener información del usuario actual</h4>
            </div>
        );
    }

    if (!movimientos) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener movimientos pendientes</h4>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <ValidacionMovimientosClient 
                movimientosIniciales={movimientos}
                usuarioId={user.usuario.UsuarioID}
            />
        </div>
    );
}
