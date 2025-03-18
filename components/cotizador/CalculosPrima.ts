interface DatosPrima {
    costoBase: number;
    ajustes?: {
        ajuste: {
            AjustePrima: string;
        };
    };
    tipoPago?: {
        PorcentajeAjuste: string;
        Divisor: number;
    };
    bonificacion?: number;
    derechoPoliza: number;
}

interface ResultadosCalculo {
    ajusteSiniestralidad: number;
    subtotalSiniestralidad: number;
    ajusteTipoPago: number;
    subtotalTipoPago: number;
    bonificacion: number;
    costoNeto: number;
    iva: number;
    total: number;
}

export const calcularPrima = ({
    costoBase,
    ajustes,
    tipoPago,
    bonificacion = 0,
    derechoPoliza
}: DatosPrima): ResultadosCalculo => {
    const ajusteSiniestralidad = ajustes?.ajuste
        ? Number(costoBase) * (Number(ajustes.ajuste.AjustePrima) / 100)
        : 0;

    const subtotalSiniestralidad = Number(costoBase) + Number(ajusteSiniestralidad);
    const bonificacionMonto = subtotalSiniestralidad * (bonificacion / 100);
    const costoNeto = subtotalSiniestralidad - bonificacionMonto;
    
    const ajusteTipoPago = tipoPago
        ? (Number(derechoPoliza) + costoNeto) * (Number(tipoPago.PorcentajeAjuste) / 100)
        : 0;

    const subtotalTipoPago = costoNeto + ajusteTipoPago;

    const montoAntesIVA = subtotalTipoPago + Number(derechoPoliza);
    const iva = montoAntesIVA * 0.16;
    const total = montoAntesIVA + iva;

    return {
        ajusteSiniestralidad,
        subtotalSiniestralidad,
        ajusteTipoPago,
        subtotalTipoPago,
        bonificacion: bonificacionMonto,
        costoNeto,
        iva,
        total
    };
};