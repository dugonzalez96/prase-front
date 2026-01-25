import { getCoberturas } from "@/actions/CatCoberturasActions";
import { getTipoPagos } from "@/actions/CatTipoPagos";
import { getTiposVehiculo, getUsoVehiculo } from "@/actions/CatVehiculosActions";
import { getCotizaciones } from "@/actions/CotizadorActions";
import { TableCotizaciones } from "@/components/admin/cotizaciones/TableCotizaciones";
import { currentUser } from "@/lib/auth";

export default async function CotizacionesListaPage() {
    const [cotizaciones, tiposVehiculo, usosVehiculo, coberturas, tiposPago, user] = await Promise.all([
        getCotizaciones(),
        getTiposVehiculo(),
        getUsoVehiculo(),
        getCoberturas(),
        getTipoPagos(),
        currentUser(),
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
                direccionSucursal={user?.Sucursal?.Direccion}
            />
        </>
    );
}