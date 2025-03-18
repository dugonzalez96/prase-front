import { getAllConfiguracionGlobal } from "@/actions/ConfiguracionGlobal"
import { NuevaConfiguracionForm } from "@/components/admin/configuracionGlobal/NuevaConfiguracionGlobal";
import { TableConfiguracionGlobal } from "@/components/admin/configuracionGlobal/TableConfiguracionGlobal";


export default async function ConfiguracionGlobal() {
    const configuraciones = await getAllConfiguracionGlobal();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Configuración Global</h2>
            {configuraciones && configuraciones.length > 0 ? (
                <TableConfiguracionGlobal
                    configuraciones={configuraciones}
                />
            ) : (
                <h4 className="text-red-500">
                    No se encontraron configuraciones globales.
                </h4>
            )}

            <h2 className="text-3xl font-bold mt-16 mb-6">Nueva Configuración Global</h2>
            <NuevaConfiguracionForm />
        </>
    )
}