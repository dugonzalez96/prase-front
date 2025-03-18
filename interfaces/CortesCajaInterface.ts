export interface iGetCorteCajaUsuario {
    TotalIngresos: number;
    TotalIngresosEfectivo: number;
    TotalIngresosTarjeta: number;
    TotalIngresosTransferencia: number;
    TotalEgresos: number;
    TotalEgresosEfectivo: number;
    TotalEgresosTarjeta: number;
    TotalEgresosTransferencia: number;
    TotalEfectivo: number;
    TotalPagoConTarjeta: number;
    TotalTransferencia: number;
    SaldoEsperado: number;
    SaldoReal: number;
    TotalEfectivoCapturado: number;
    TotalTarjetaCapturado: number;
    TotalTransferenciaCapturado: number;
    Diferencia: number;
    Observaciones: string;
    Estatus: string;
}

export interface iPostGuardarCorteCaja {
    usuarioID: number;
    SaldoReal: number;
    TotalEfectivoCapturado: number;
    TotalTarjetaCapturado: number;
    TotalTransferenciaCapturado: number;
    Observaciones: string;
}

export interface iPatchCorteCaja {
    SaldoReal?: number;
    TotalEfectivoCapturado?: number;
    TotalTarjetaCapturado?: number;
    TotalTransferenciaCapturado?: number;
    Diferencia?: number;
    Observaciones?: string;
    Estatus?: string;
}

export interface iPostGuardarCorteResp {
    FechaCorte: Date;
    TotalIngresos: number;
    TotalIngresosEfectivo: string;
    TotalIngresosTarjeta: string;
    TotalIngresosTransferencia: string;
    TotalEgresos: number;
    TotalEgresosEfectivo: string;
    TotalEgresosTarjeta: string;
    TotalEgresosTransferencia: string;
    TotalEfectivo: string;
    TotalPagoConTarjeta: string;
    TotalTransferencia: string;
    SaldoEsperado: number;
    SaldoReal: number;
    TotalEfectivoCapturado: string;
    TotalTarjetaCapturado: string;
    TotalTransferenciaCapturado: string;
    Diferencia: number;
    Observaciones: string;
    Estatus: string;
    InicioCaja: InicioCaja;
    CorteUsuarioID: number;
    FechaActualizacion: Date;
}

export interface iGetCortesCaja {
    CorteUsuarioID: number;
    FechaCorte: Date;
    FechaActualizacion: Date;
    TotalIngresos: string;
    TotalIngresosEfectivo: string;
    TotalIngresosTarjeta: string;
    TotalIngresosTransferencia: string;
    TotalEgresos: string;
    TotalEgresosEfectivo: string;
    TotalEgresosTarjeta: string;
    TotalEgresosTransferencia: string;
    TotalEfectivo: string;
    TotalPagoConTarjeta: string;
    TotalTransferencia: string;
    SaldoEsperado: string;
    SaldoReal: string;
    TotalEfectivoCapturado: string;
    TotalTarjetaCapturado: string;
    TotalTransferenciaCapturado: string;
    Diferencia: string;
    Observaciones: string;
    Estatus: string;
    InicioCaja: InicioCaja;
}

export interface InicioCaja {
    InicioCajaID: number;
    FechaInicio: Date;
    FechaActualizacion: Date;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: null | string;
    Estatus: string;
}
