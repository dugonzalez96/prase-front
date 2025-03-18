import { getTiposSumasAseguradas } from "@/actions/CatSumasAseguradasActions";
import { NuevoTipoSumaForm } from "@/components/admin/catalogos/tipos-sumas-aseguradas/NuevoTipoSumaForm";
import { TableTiposSumas } from "@/components/admin/catalogos/tipos-sumas-aseguradas/TableTiposSuma";

export default async function TiposSumasAseguradasPage() {
    const tiposSumas = await getTiposSumasAseguradas();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Tipos de Sumas Aseguradas</h2>

            {tiposSumas && tiposSumas.length > 0 ? (
                <TableTiposSumas
                    tiposSumas={tiposSumas}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los tipos de sumas aseguradas.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Paquete</h3>
            <NuevoTipoSumaForm />
        </>
    )
}