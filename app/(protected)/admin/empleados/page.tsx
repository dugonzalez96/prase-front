import { getEmpleados, getTiposEmpleado } from "@/actions/EmpleadosActionts";
import { NuevoEmpleadoForm } from "@/components/admin/empleados/NuevoEmpleadoForm";
import { TablaEmpleados } from "@/components/admin/empleados/TablaEmpleados";

export default async function EmpleadosPage() {
    const empleados = await getEmpleados();
    const tiposEmpleado = await getTiposEmpleado();

    return (
        <>
            {!empleados ? (
                <h4 className="text-red-500">Hubo un problema para obtener los datos de empleados.</h4>
            ) : (
                <>
                    {
                        empleados.length === 0 ? (
                            <h4 className="text-red-500">No existen empleados registrados.</h4>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold mb-6">Lista de empleados</h2>
                                <TablaEmpleados
                                    empleados={empleados}
                                />
                            </>
                        )
                    }
                </>
            )}

            {tiposEmpleado && (
                <>
                    <h2 className="text-3xl font-bold mt-8 mb-6">Lista de empleados</h2>
                    <NuevoEmpleadoForm
                        tiposEmpleado={tiposEmpleado}
                    />
                </>
            )}
        </>
    )
}