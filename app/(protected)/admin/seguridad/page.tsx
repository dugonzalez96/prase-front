import { getApplications, getApplicationsGroup, getGroups } from "@/actions/SeguridadActions"
import { GestionAplicacionesGrupo } from "@/components/admin/catalogos/seguridad/GestionAplicacionesGrupo";
import { NuevaAplicacionForm } from "@/components/admin/catalogos/seguridad/NuevaAplicacionForm";
import { NuevoGroupForm } from "@/components/admin/catalogos/seguridad/NuevoGroupForm";
import { ResumenPermisosAplicaciones } from "@/components/admin/catalogos/seguridad/ResumenPermisosAplicaciones";
import { TableAplicaciones } from "@/components/admin/catalogos/seguridad/TableAplicaciones";
import { TableGroups } from "@/components/admin/catalogos/seguridad/TableGroups";

export default async function SeguridadPage() {
    const grupos = await getGroups();
    const aplicaciones = await getApplications();
    const aplicacionesGrupos = await getApplicationsGroup();

    if (!grupos || !aplicaciones || !aplicacionesGrupos) {
        return <h4 className="text-red-500">Hubo un error al obtener los datos.</h4>;
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Seguridad</h2>

            <h3 className="text-2xl font-bold mt-8 mb-6">Grupos</h3>
            <TableGroups
                groups={grupos}
            />

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Grupo</h3>
            <NuevoGroupForm />

            <h3 className="text-2xl font-bold mt-8 mb-6">Aplicaciones</h3>
            <TableAplicaciones
                applications={aplicaciones}
            />

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Aplicación</h3>
            <NuevaAplicacionForm />

            <h3 className="text-2xl font-bold mt-16 mb-6">Gestión de Permisos de Aplicaciones y Grupos</h3>
            
            <ResumenPermisosAplicaciones
                initialGroups={aplicacionesGrupos}
            />

            <GestionAplicacionesGrupo
                grupos={grupos}
                aplicaciones={aplicaciones}
            />

        </>
    )
}