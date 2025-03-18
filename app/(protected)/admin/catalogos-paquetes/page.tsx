import { getAllPaquetes } from "@/actions/CatPaquetesActions"
import { NuevoPaqueteForm } from "@/components/admin/catalogos/paquetes/NuevoPaqueteForm";
import { TablePaquetes } from "@/components/admin/catalogos/paquetes/TablePaquetes";

export default async function CatalogoPaquetesPage() {
    const paquetes = await getAllPaquetes();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Paquetes de Cobertura</h2>

            {paquetes && paquetes.length > 0 ? (
                <TablePaquetes
                    paquetes={paquetes}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los paquetes.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Paquete</h3>
            <NuevoPaqueteForm />
        </>
    )
}