import { getEmpleados } from "@/actions/EmpleadosActionts";
import { getGroups, getUsuarios } from "@/actions/SeguridadActions";
import { getSucursales } from "@/actions/SucursalesActions";
import { NuevoUsuarioForm } from "@/components/admin/usuarios/NuevoUsuarioForm";
import { TableUsuarios } from "@/components/admin/usuarios/TableUsuarios";
import { MensajeError } from "@/components/ui/MensajeError";

export default async function UsuariosPage() {
    const [grupos, usuarios, empleados, sucursales] = await Promise.all([
        getGroups(),
        getUsuarios(),
        getEmpleados(),
        getSucursales(),
    ]);

    const validaciones = {
        grupos: { data: grupos, mensaje: "Hubo un error al obtener los grupos." },
        empleados: { data: empleados, mensaje: "No se encontraron empleados registrados, no se puede continuar." },
        sucursales: { data: sucursales, mensaje: "No se encontraron sucursales registradas, no se puede continuar." }
    };

    for (const [, value] of Object.entries(validaciones)) {
        if (!value.data || value.data.length === 0) {
            return <MensajeError mensaje={value.mensaje} />;
        }
    }

    const mostrarTablaUsuarios = grupos && grupos.length > 0 && usuarios && usuarios.length > 0;
    const puedeRegistrarUsuarios = grupos && empleados && empleados.length > 0 && sucursales;

    return (
        <>
            {mostrarTablaUsuarios ? (
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-6">Usuarios</h2>
                    <TableUsuarios usuarios={usuarios} grupos={grupos} />
                </div>
            ) : (
                <h4 className="text-red-500 mb-16">
                    {usuarios ? "No existen usuarios registrados." : "Hubo un error al obtener los usuarios."}
                </h4>
            )}

            {puedeRegistrarUsuarios && (
                <>
                    <h2 className="text-3xl font-bold mb-6">Registrar nuevo usuario</h2>
                    <NuevoUsuarioForm
                        groups={grupos}
                        empleados={empleados}
                        sucursales={sucursales}
                    />
                </>
            )}
        </>
    );
}