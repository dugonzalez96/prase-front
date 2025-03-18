import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getTipoPagos } from "@/actions/CatTipoPagos";
import { getTiposVehiculo, getUsoVehiculo } from "@/actions/CatVehiculosActions";
import { getCotizaciones } from "@/actions/CotizadorActions";
import { TableCotizaciones } from "@/components/admin/cotizaciones/TableCotizaciones";

export default async function CotizacionesListaPage() {
    const [cotizaciones, tiposVehiculo, usosVehiculo, coberturas, tiposPago] = await Promise.all([
        getCotizaciones(),
        getTiposVehiculo(),
        getUsoVehiculo(),
        getCoberturas(),
        getTipoPagos(),
    ]);

    if (!cotizaciones || cotizaciones.length === 0) {
        return (
            <div>
                No hay cotizaciones disponibles.
            </div>
        );
    }

    if (!tiposVehiculo || !usosVehiculo) {
        return (
            <div>
                Error al cargar los datos necesarios.
            </div>
        );
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-6">Cotizaciones</h2>
            <TableCotizaciones
                cotizaciones={cotizaciones}
                tiposVehiculo={tiposVehiculo}
                usosVehiculo={usosVehiculo}
                coberturasData={coberturas}
                tiposPago={tiposPago}
            />
        </>
    );
}