import { getTipoPagos } from "@/actions/CatTipoPagos"
import { NuevoTipoPagoForm } from "@/components/admin/catalogos/tipos-pago/NuevoTipoPagoForm";
import { TableTipoPagos } from "@/components/admin/catalogos/tipos-pago/TableTipoPagos";

export default async function CatalogoTiposPagoPage() {
    const tiposPago = await getTipoPagos();

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Catálogo Tipos de Pago</h2>

            {tiposPago && tiposPago.length > 0 ? (
                <TableTipoPagos
                    tiposPago={tiposPago}
                />
            ) : (
                <h4 className="text-red-500">Hubo un error al obtener los tipos de pago.</h4>
            )}

            <h3 className="text-2xl font-bold mt-16 mb-6">Nuevo Tipo de Pago</h3>
            <NuevoTipoPagoForm />
        </>
    )
}