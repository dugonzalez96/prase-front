import { getUsoVehiculo } from "@/actions/CatVehiculosActions"
import { NuevoUsoVehiculoForm } from "@/components/admin/catalogos/usos-vehiculo/NuevoUsoVehiculoForm";
import { TableUsosVehiculo } from "@/components/admin/catalogos/usos-vehiculo/TableUsosVehiculo";

export default async function CatalogoUsoVehiculosPage() {
    const usosVehiculo = await getUsoVehiculo();

    if (!usosVehiculo || usosVehiculo.length === 0) {
        return (
            <div>Error al obtener los usos de vehículo, no se puede continuar.</div>
        )
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Usos de Vehículo</h2>

            <TableUsosVehiculo
                usosVehiculo={usosVehiculo}
            />

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Uso de Vehículo</h3>
            <NuevoUsoVehiculoForm />
        </>
    )
}