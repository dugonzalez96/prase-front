import { getAllAjustesCP } from "@/actions/AjustesCP";
import { NuevoAjusteCP } from "@/components/admin/catalogos/ajustes-cp/NuevoAjusteCP";
import { TableAjustesCP } from "@/components/admin/catalogos/ajustes-cp/TableAjustesCP";

export default async function AjustesCPPage() {
    const ajustesCP = await getAllAjustesCP();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo de Ajustes por Código Postal</h2>

            {ajustesCP ? (
                <TableAjustesCP ajustesCP={ajustesCP} />
            ) : (
                <h4 className="text-red-500">Error al obtener los ajustes.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Ajuste por Código Postal</h3>
            <NuevoAjusteCP />
        </>
    );
}