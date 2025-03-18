import { getTiposMoneda } from "@/actions/CatMonedasActions";
import { getAllReglasNegocio, getAllCoberturas } from "@/actions/ReglasNegocio"
import { NuevaReglaForm } from "@/components/admin/catalogos/reglas-negocios/NuevaReglaForm";
import { TableReglasNegocio } from "@/components/admin/catalogos/reglas-negocios/TableReglasNegocio";

export default async function ReglasNegocioPage() {
    const reglas = await getAllReglasNegocio();
    const coberturas = await getAllCoberturas();
    const tiposMoneda = await getTiposMoneda();

    if (!tiposMoneda || tiposMoneda.length === 0) {
        return (
            <div>
                Hubo un error al obtener los tipos de moneda.
            </div>
        )
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Reglas de negocio</h2>

            {reglas && reglas.length > 0 ? (
                <TableReglasNegocio
                    tiposMoneda={tiposMoneda}
                    coberturas={coberturas || []}
                    reglas={reglas}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener las reglas de negocio.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Regla de Negocio</h3>
            <NuevaReglaForm
                coberturas={coberturas || []}
                tiposMoneda={tiposMoneda}
            />

        </>
    )
}