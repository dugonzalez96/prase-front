// Interfaces para el módulo de Caja Chica

export interface iCajaChica {
    CajaChicaID: number;
    Fecha: Date;
    SaldoInicial: number;
    SaldoActual: number;
    LimiteMaximo: number;
    Estado: 'ACTIVA' | 'PRECUADRE' | 'CUADRADA' | 'CERRADA';
    UsuarioResponsableID: number;
    UsuarioResponsable?: {
        UsuarioID: number;
        NombreUsuario: string;
    };
    SucursalID?: number;
}

export interface iMovimientoCajaChica {
    MovimientoCajaChicaID: number;
    CajaChicaID: number;
    TipoMovimiento: 'GASTO' | 'REPOSICION';
    Monto: string;
    Concepto: string;
    Categoria?: string;
    Comprobante?: string;
    FechaMovimiento: Date;
    UsuarioRegistroID: number;
    UsuarioRegistro?: {
        UsuarioID: number;
        NombreUsuario: string;
    };
    GerenteAproboID?: number;
    GerenteAprobo?: {
        UsuarioID: number;
        NombreUsuario: string;
    };
}

export interface iPostGastoCajaChica {
    CajaChicaID: number;
    Monto: number;
    Concepto: string;
    Categoria: string;
    Comprobante?: string;
    UsuarioRegistroID: number;
    GerenteAproboID?: number;
}

export interface iPrecuadreCajaChica {
    PrecuadreID: number;
    CajaChicaID: number;
    SaldoEsperado: number;
    EfectivoContado: number;
    TotalComprobantes: number;
    Diferencia: number;
    Observaciones?: string;
    FechaPrecuadre: Date;
    UsuarioID: number;
}

export interface iPostPrecuadreCajaChica {
    CajaChicaID: number;
    EfectivoContado: number;
    TotalComprobantes: number;
    Observaciones?: string;
    UsuarioID: number;
}

export interface iCuadreCajaChica {
    CuadreID: number;
    CajaChicaID: number;
    PrecuadreID: number;
    SaldoFinal: number;
    DiferenciaFinal: number;
    Ajustes?: string;
    EstadoFinal: 'CUADRADA' | 'CON_DIFERENCIA';
    FechaCuadre: Date;
    UsuarioID: number;
    GerenteValidoID?: number;
    MontoTransferidoCajaGeneral: number;
}

export interface iPostCuadreCajaChica {
    CajaChicaID: number;
    PrecuadreID: number;
    SaldoFinal: number;
    Ajustes?: string;
    UsuarioID: number;
    GerenteValidoID?: number;
}

export interface iResumenCajaChica {
    SaldoInicial: number;
    TotalGastos: number;
    TotalReposiciones: number;
    SaldoActual: number;
    CantidadGastos: number;
    Estado: string;
}
