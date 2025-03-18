import { iDetallesGetCotizacion } from "@/interfaces/CotizacionInterface";
import { formatCurrency } from "./format";

interface DetalleMostrado extends iDetallesGetCotizacion {
    NombreCobertura?: string;
    Descripcion?: string;
    DisplaySumaAsegurada?: string;
    DisplayDeducible?: string;
    TipoMoneda?: string;
    EsAmparada?: boolean;
    SumaAseguradaPorPasajero?: boolean;
    TipoDeducible?: string;
}

const obtenerValorSumaAsegurada = (detalle: any): React.ReactNode => {
    if (detalle.EsAmparada || Number(detalle.MontoSumaAsegurada) === 0) {
        return "AMPARADA";
    }

    if (detalle.DisplaySumaAsegurada) {
        if (detalle.SumaAseguradaPorPasajero) {
            return (
                <div className="flex flex-col gap-1">
                    <span>{detalle.DisplaySumaAsegurada}</span>
                    <span className="text-sm text-muted-foreground">POR CADA PASAJERO</span>
                </div>
            );
        } else return detalle.DisplaySumaAsegurada;
    }

    if (detalle.TipoMoneda === "UMA") {
        return `${detalle.MontoSumaAsegurada} UMAS`;
    }

    if (detalle.SumaAseguradaPorPasajero) {
        return (
            <div className="flex flex-col gap-1">
                <span>{formatCurrency(Number(detalle.MontoSumaAsegurada))}</span>
                <span className="text-sm text-muted-foreground">POR CADA PASAJERO</span>
            </div>
        );
    }

    return formatCurrency(Number(detalle.MontoSumaAsegurada));
};

const obtenerValorDeducible = (detalle: any): string => {
    if (detalle.TipoDeducible === "UMA") {
        return `${detalle.MontoDeducible} UMAS`;
    }

    const deducible = Number(detalle.MontoDeducible);
    return deducible > 0 ? `${deducible}%` : "NO APLICA";
};

const generarColumnasPDF = (detalles: any[]) => {
    // console.log(detalles)
    return detalles.map(detalle => [
        detalle.NombreCobertura || '',
        detalle.EsAmparada || Number(detalle.MontoSumaAsegurada) === 0
            ? 'AMPARADA'
            : detalle.SumaAseguradaPorPasajero
                ? `${detalle.DisplaySumaAsegurada ?? formatCurrency(Number(detalle.MontoSumaAsegurada))} POR PASAJERO`
                : detalle.DisplaySumaAsegurada ?? `${formatCurrency(Number(detalle.MontoSumaAsegurada))}`,
        obtenerValorDeducible(detalle),
        formatCurrency(Number(detalle.PrimaCalculada))
    ]);
};

export {
    obtenerValorSumaAsegurada,
    obtenerValorDeducible,
    generarColumnasPDF,
    type DetalleMostrado
};