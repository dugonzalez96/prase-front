import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getTiposDeducible } from "@/actions/CatDeduciblesActions";
import { getTiposMoneda } from "@/actions/CatMonedasActions";
import { NuevaCoberturaForm } from "@/components/admin/catalogos/coberturas/NuevaCoberturaForm";
import { TableCoberturas } from "@/components/admin/catalogos/coberturas/TableCoberturas";

export default async function CatalogoPaquetesPage() {
    const coberturas = await getCoberturas();
    const tiposMoneda = await getTiposMoneda();
    const tiposDeducible = await getTiposDeducible();

    if (!tiposMoneda || tiposMoneda.length === 0) {
        return (
            <div>Error al obtener los tipos de moneda, no se puede continuar.</div>
        )
    }

    if (!tiposDeducible || tiposDeducible.length === 0) {
        return (
            <div>Error al obtener los tipos de deducible, no se puede continuar.</div>
        )
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo de Coberturas</h2>

            {coberturas && coberturas.length > 0 ? (
                <TableCoberturas
                    coberturas={coberturas}
                    tiposMoneda={tiposMoneda}
                    tiposDeducible={tiposDeducible}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los paquetes.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Cobertura</h3>
            <NuevaCoberturaForm
                tiposMoneda={tiposMoneda}
                tiposDeducible={tiposDeducible}
            />
        </>
    )
}