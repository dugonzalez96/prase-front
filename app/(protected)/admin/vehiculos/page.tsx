import { getTiposVehiculo, getUsoVehiculo } from '@/actions/CatVehiculosActions';
import { getAllClientes } from '@/actions/ClientesActions';
import { getAllVehiculos } from '@/actions/vehiculoActions';
import { NuevoVehiculoForm } from '@/components/admin/catalogos/vehiculos/NuevoVehiculoForm';
import { TableVehiculos } from '@/components/admin/catalogos/vehiculos/TablaVehiculos';
import { Suspense } from 'react';

export default async function Vehiculos() {
    const vehiculos = await getAllVehiculos();
    const clientes = await getAllClientes();
    const tiposVehiculo = await getTiposVehiculo();
    const usosVehiculo = await getUsoVehiculo();

    if(!tiposVehiculo || tiposVehiculo.length === 0){
        return (
            <h4 className="text-red-500">No se pudieron obtener los tipos de vehículo, inténtelo nuevamente.</h4>
        )
    }

    if(!usosVehiculo || usosVehiculo.length === 0){
        return (
            <h4 className="text-red-500">No se pudieron obtener los usos de vehículo, inténtelo nuevamente.</h4>
        )
    }

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <h2 className="text-3xl font-bold mb-6">Vehículo</h2>
            {vehiculos ? (
                vehiculos.length > 0 ? (
                    <TableVehiculos
                        vehiculos={vehiculos}
                        tiposVehiculo={tiposVehiculo}
                        usosVehiculo={usosVehiculo}
                    />
                ) : (
                    <h4 className="text-red-500">No hay vehículos registrados.</h4>
                )
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los vehículos.</h4>
            )}

            {(tiposVehiculo && tiposVehiculo.length > 0 && usosVehiculo && usosVehiculo.length > 0) ? (
                <>
                    <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Vehículo</h3>
                    <NuevoVehiculoForm
                        clientes={clientes || []}
                        tiposVehiculo={tiposVehiculo}
                        usosVehiculo={usosVehiculo}
                    />
                </>
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los datos, intente nuevamente.</h4>
            )}

        </Suspense>
    );
}
