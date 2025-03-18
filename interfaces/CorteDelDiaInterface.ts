export interface InicioCaja {
    InicioCajaID: number;
    FechaInicio: string;
    FechaActualizacion: string;
    MontoInicial: string;
    TotalEfectivo: string;
    TotalTransferencia: string;
    FirmaElectronica: string;
    Estatus: string;
}

export interface Usuario {
    UsuarioID: number
    NombreUsuario: string
    Contrasena: string
    EmpleadoID: number
    SucursalID: number | null
}

export interface CorteUsuario {
    CorteUsuarioID: number
    FechaCorte: string
    FechaActualizacion: string
    TotalIngresos: string
    TotalIngresosEfectivo: string
    TotalIngresosTarjeta: string
    TotalIngresosTransferencia: string
    TotalEgresos: string
    TotalEgresosEfectivo: string
    TotalEgresosTarjeta: string
    TotalEgresosTransferencia: string
    TotalEfectivo: string
    TotalPagoConTarjeta: string
    TotalTransferencia: string
    SaldoEsperado: string
    SaldoReal: string
    TotalEfectivoCapturado: string
    TotalTarjetaCapturado: string
    TotalTransferenciaCapturado: string
    Diferencia: string
    Observaciones: string
    Estatus: string
    usuarioID: Usuario
    InicioCaja?: {
        InicioCajaID: number
        FechaInicio: string
        FechaActualizacion: string
        MontoInicial: string
        TotalEfectivo: string
        TotalTransferencia: string
        FirmaElectronica: string
        Estatus: string
    }
}
export interface IGetAllCorteDia {
    CorteUsuarioID: number;
    FechaCorte: string;
    FechaActualizacion: string;
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

export interface IPostCorteDelDia {
    usuarioID: number;
    SaldoReal: number;
    TotalEfectivoCapturado: number;
    TotalTarjetaCapturado: number;
    TotalTransferenciaCapturado: number;
    Observaciones: string | undefined;
}

export interface IGetCorteDelDia {
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