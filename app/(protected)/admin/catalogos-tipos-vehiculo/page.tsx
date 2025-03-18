import { getTiposVehiculo, getUsoVehiculo } from "@/actions/CatVehiculosActions"
import { NuevoTipoVehiculoForm } from "@/components/admin/catalogos/tipos-vehiculo/NuevoTipoVehiculoForm";
import { TableTiposVehiculo } from "@/components/admin/catalogos/tipos-vehiculo/TableTiposVehiculo";

export default async function CatalogosTiposVehiculoPage() {
    const tiposVehiculo = await getTiposVehiculo();
    const usosVehiculo = await getUsoVehiculo();

    if (!tiposVehiculo || tiposVehiculo.length === 0) {
        return (
            <div>Error al obtener los tipos de vehículo, no se puede continuar.</div>
        )
    }

    if (!usosVehiculo || usosVehiculo.length === 0) {
        return (
            <div>Error al obtener los usos de vehículo, no se puede continuar.</div>
        )
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Usos de Vehículo</h2>

            <TableTiposVehiculo
                tiposVehiculo={tiposVehiculo}
                usosVehiculo={usosVehiculo}
            />

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Uso de Vehículo</h3>
            <NuevoTipoVehiculoForm
                usosVehiculo={usosVehiculo}
            />
        </>
    )
}