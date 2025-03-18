import { getDeducibles } from "@/actions/CatDeduciblesActions"
import { NuevoDeducibleForm } from "@/components/admin/catalogos/deducibles/NuevoDeducibleForm";
import { TableDeducibles } from "@/components/admin/catalogos/deducibles/TableDeducibles";

export default async function CatalogosDeduciblesPage() {
    const deducibles = await getDeducibles();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Deducibles</h2>

            {deducibles && deducibles.length > 0 ? (
                <TableDeducibles
                    deducibles={deducibles}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los paquetes.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Deducible</h3>
            <NuevoDeducibleForm />
        </>
    )
}