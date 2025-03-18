import { getTiposMoneda } from "@/actions/CatMonedasActions"
import { NuevaMonedaForm } from "@/components/admin/catalogos/monedas/NuevaMonedaForm";
import { TableMonedas } from "@/components/admin/catalogos/monedas/TableMonedas";

export default async function CatalogosMonedasPage() {
    const tiposMoneda = await getTiposMoneda();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Monedas</h2>

            {tiposMoneda && tiposMoneda.length > 0 ? (
                <TableMonedas
                    monedas={tiposMoneda}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los tipos de moneda.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nueva Moneda</h3>
            <NuevaMonedaForm />
        </>
    )
}