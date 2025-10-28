// Interfaces para el módulo de Caja General

export enum TipoIngresoCajaGeneral {
    CORTE_USUARIO = 'CORTE_USUARIO',
    PAGO_POLIZA = 'PAGO_POLIZA',
    CIERRE_CAJA_CHICA = 'CIERRE_CAJA_CHICA',
    TRANSFERENCIA_RECIBIDA = 'TRANSFERENCIA_RECIBIDA',
    OTRO_INGRESO = 'OTRO_INGRESO'
}

export enum TipoEgresoCajaGeneral {
    REPOSICION_CAJA_CHICA = 'REPOSICION_CAJA_CHICA',
    DEPOSITO_BANCARIO = 'DEPOSITO_BANCARIO',
    GASTO_ADMINISTRATIVO = 'GASTO_ADMINISTRATIVO',
    RETIRO_AUTORIZADO = 'RETIRO_AUTORIZADO',
    PAGO_PROVEEDOR = 'PAGO_PROVEEDOR',
    OTRO_EGRESO = 'OTRO_EGRESO'
}

export interface iCajaGeneral {
    CajaGeneralID: number;
    Fecha: Date;
    SaldoInicial: number;
    TotalIngresos: number;
    TotalEgresos: number;
    SaldoFinal: number;
    SaldoEsperado: number;
    Diferencia: number;
    Estado: 'ABIERTA' | 'PRECUADRE' | 'CUADRADA' | 'CERRADA';
    SucursalID?: number;
    GerenteResponsableID: number;
    GerenteResponsable?: {
        UsuarioID: number;
        NombreUsuario: string;
    };
}

export interface iMovimientoCajaGeneral {
    MovimientoCajaGeneralID: number;
    CajaGeneralID: number;
    TipoMovimiento: 'INGRESO' | 'EGRESO';
    Categoria: string;
    Monto: string;
    Descripcion: string;
    ReferenciaID?: number;
    TipoReferencia?: string;
    Comprobante?: string;
    FechaMovimiento: Date;
    UsuarioRegistroID: number;
    UsuarioRegistro?: {
        UsuarioID: number;
        NombreUsuario: string;
    };
    AutorizadoPorID?: number;
    AutorizadoPor?: {
        UsuarioID: number;
        NombreUsuario: string;
    };
}

export interface iPostMovimientoCajaGeneral {
    CajaGeneralID: number;
    TipoMovimiento: 'INGRESO' | 'EGRESO';
    Categoria: string;
    Monto: number;
    Descripcion: string;
    ReferenciaID?: number;
    TipoReferencia?: string;
    Comprobante?: string;
    UsuarioRegistroID: number;
    AutorizadoPorID?: number;
}

export interface iPrecuadreCajaGeneral {
    PrecuadreGeneralID: number;
    CajaGeneralID: number;
    TotalCortesUsuarios: number;
    TotalIngresosDirectos: number;
    TotalEgresos: number;
    SaldoEsperado: number;
    EfectivoContado: number;
    Diferencia: number;
    DesgloseDenominaciones?: iDesgloseDenominaciones;
    Observaciones?: string;
    FechaPrecuadre: Date;
    GerenteID: number;
}

export interface iDesgloseDenominaciones {
    billetes1000: number;
    billetes500: number;
    billetes200: number;
    billetes100: number;
    billetes50: number;
    billetes20: number;
    monedas: number;
}

export interface iPostPrecuadreCajaGeneral {
    CajaGeneralID: number;
    EfectivoContado: number;
    DesgloseDenominaciones?: iDesgloseDenominaciones;
    Observaciones?: string;
    GerenteID: number;
}

export interface iCuadreCajaGeneral {
    CuadreGeneralID: number;
    CajaGeneralID: number;
    PrecuadreGeneralID: number;
    SaldoFinalConfirmado: number;
    DiferenciaFinal: number;
    EfectivoADepositar: number;
    FondoFijoProximoDia: number;
    Ajustes?: string;
    EstadoFinal: 'CUADRADA' | 'CON_DIFERENCIA';
    FechaCuadre: Date;
    GerenteID: number;
    AdminAutorizoID?: number;
}

export interface iPostCuadreCajaGeneral {
    CajaGeneralID: number;
    PrecuadreGeneralID: number;
    SaldoFinalConfirmado: number;
    EfectivoADepositar: number;
    FondoFijoProximoDia: number;
    Ajustes?: string;
    GerenteID: number;
    AdminAutorizoID?: number;
}

export interface iResumenCajaGeneral {
    SaldoInicial: number;
    TotalIngresos: number;
    TotalEgresos: number;
    SaldoActual: number;
    CortesValidados: number;
    CortesPendientes: number;
    Estado: string;
}

export interface iCorteUsuarioResumen {
    CorteUsuarioID: number;
    NombreUsuario: string;
    TotalEfectivo: number;
    Estado: 'CERRADO' | 'PENDIENTE';
    FechaCorte: Date;
}
