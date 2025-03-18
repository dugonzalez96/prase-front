import { getAllClientes } from '@/actions/ClientesActions';
import { NuevoClienteForm } from '@/components/admin/catalogos/clientes/NuevoClienteForm';
import { TableClientes } from '@/components/admin/catalogos/clientes/TablaClientes';
import { Suspense } from 'react'

export default async function Clientes() {
    const clientes = await getAllClientes();
    return (
        <Suspense fallback={<div>Cargando...</div>}>

            <h2 className="text-3xl font-bold mb-6">Clientes</h2>

            {clientes && clientes.length > 0 ? (
                <TableClientes clientes={clientes} />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los clientes.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Cliente</h3>
            <NuevoClienteForm />
        </Suspense>
    )
}