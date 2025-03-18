export interface iGetTipoPagos {
    TipoPagoID: number;
    Descripcion: string;
    PorcentajeAjuste: string;
    Divisor: number;
}

export interface iPostTipoPago {
    Descripcion: string;
    PorcentajeAjuste: number;
    Divisor: number;
}

export interface iPatchTipoPago {
    Descripcion?: string;
    PorcentajeAjuste?: number;
    Divisor?: string;
}
