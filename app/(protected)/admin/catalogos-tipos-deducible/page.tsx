import { getTiposDeducible } from "@/actions/CatDeduciblesActions"
import { NuevoTipoDeducibleForm } from "@/components/admin/catalogos/tipos-deducible/NuevoTipoDeducibleForm";
import { TableTiposDeducible } from "@/components/admin/catalogos/tipos-deducible/TableTiposDeducible";

export default async function CatalogoTiposDeduciblePage() {
    const tiposDeducible = await getTiposDeducible();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Tipos de Deducible</h2>

            {tiposDeducible && tiposDeducible.length > 0 ? (
                <TableTiposDeducible
                    tiposDeducible={tiposDeducible}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los tipos de deducible.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Tipo de Deducible</h3>
            <NuevoTipoDeducibleForm />
        </>
    )
}