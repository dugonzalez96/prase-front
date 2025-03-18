import { getSucursales } from "@/actions/SucursalesActions";
import { NuevaSucursalForm } from "@/components/admin/catalogos/sucursales/NuevaSucursalForm";
import { TableSucursales } from "@/components/admin/catalogos/sucursales/TableSucursales";
import { MensajeError } from "@/components/ui/MensajeError";

export default async function SucursalesPage() {
    const sucursales = await getSucursales();

    if (!sucursales || sucursales.length === 0) {
        return (
            <MensajeError mensaje="Hubo un problema al obtener sucursales" />
        )
    }
    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo de Sucursales</h2>
            <TableSucursales
                sucursales={sucursales}
            />

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Sucursal</h3>
            <NuevaSucursalForm
            />
        </>
    )
}