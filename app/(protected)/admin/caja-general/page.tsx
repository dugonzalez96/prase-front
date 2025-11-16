import { 
    getCajaGeneralDashboard,
    getPreCuadreCajaGeneral
} from "@/actions/CajaGeneralActions";
import { getSucursales } from "@/actions/SucursalesActions";
import { getUsuarios } from "@/actions/SeguridadActions";
import { getCuentasBancarias } from "@/actions/ClientesActions";
import { CajaGeneralPage } from "@/components/admin/caja-general/CajaGeneralPage";
import { currentUser } from "@/lib/auth";

export default async function CajaGeneralPageServer() {
    const user = await currentUser();
    const sucursales = await getSucursales();
    const usuarios = await getUsuarios();
    const cuentasBancarias = await getCuentasBancarias();
    
    // Obtener fecha local (no UTC)
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaActual = `${año}-${mes}-${dia}`;
    
    const dashboardInicial = await getCajaGeneralDashboard(fechaActual);
    const preCuadreInicial = await getPreCuadreCajaGeneral(fechaActual);

    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <h4 className="text-red-500">Error al obtener información del usuario actual</h4>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <CajaGeneralPage 
                usuarioId={user.usuario.UsuarioID}
                sucursalUsuarioId={user.Sucursal.SucursalID}
                sucursales={sucursales || []}
                dashboardInicial={dashboardInicial || null}
                preCuadreInicial={preCuadreInicial || null}
                usuarios={usuarios || []}
                cuentasBancarias={cuentasBancarias || []}
                fechaActual={fechaActual}
            />
        </div>
    );
}
