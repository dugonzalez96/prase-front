import { getCuentasBancarias } from "@/actions/ClientesActions";
import { getMovimientosByID } from "@/actions/MovimientosActions"
import { getUsuarios } from "@/actions/SeguridadActions";
import { NuevoMovimientoForm } from "@/components/admin/movimientos/NuevoMovimientoForm";
import { TablaMovimientos } from "@/components/admin/movimientos/TablaMovimientos";
import { MensajeError } from "@/components/ui/MensajeError";
import { currentUser } from "@/lib/auth";
import { ClienteGenerarCodigo } from "@/components/admin/movimientos/ClienteGenerarCodigo";

export default async function MovimientosPage() {
    const [movimientos, cuentasBancarias, usuarios, user] = await Promise.all([
        getMovimientosByID(),
        getCuentasBancarias(),
        getUsuarios(),
        currentUser()
    ]);
    
    if (!user) {
        return (
            <h4 className="text-red-500">Error al obtener información del usuario actual, intente nuevamente.</h4>
        )
    }

    if (!cuentasBancarias || !usuarios) {
        return (
            <MensajeError mensaje="Hubo un error al obtener los datos necesarios." />
        )
    }

    return (
        <>
            {!movimientos || movimientos.length === 0 ? (
                <MensajeError mensaje="No existen movimientos registrados." />
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6 container">
                        <h2 className="text-3xl font-bold">Lista de movimientos</h2>
                        <ClienteGenerarCodigo />
                    </div>
                    <TablaMovimientos movimientos={movimientos} />
                </>
            )}

            <h2 className="text-3xl font-bold mb-6 mt-8">Registrar nuevo movimiento</h2>
            <NuevoMovimientoForm
                cuentasBancarias={cuentasBancarias}
                usuarioId={user.usuario.UsuarioID}
                usuarios={usuarios}
            />
        </>
    )
}