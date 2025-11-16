// Interfaces para el módulo de Caja Chica

// === Inicio de Caja ===
export interface iInicioCaja {
    InicioCajaID: number;
    UsuarioID: number;
    Usuario: string;
    AutorizoID: number;
    Autorizo: string;
    FechaInicio: Date;
    MontoInicial: number;
    Estatus: string;
}

// === Usuario Pendiente ===
export interface iUsuarioMovimiento {
    UsuarioID: number;
    Nombre: string;
}

// === Precuadre (respuesta del backend) ===
export interface iPrecuadreCajaChicaBackend {
    FechaDesde: Date | null;
    FechaHasta: Date;
    FondoInicial: number;
    Totales: {
        TotalIngresos: number;
        TotalEgresos: number;
        TotalEfectivo: number;
        TotalPagoConTarjeta: number;
        TotalTransferencia: number;
    };
    SaldoEsperado: number;
    SaldoReal: number;
    TotalEfectivoCapturado: number;
    TotalTarjetaCapturado: number;
    TotalTransferenciaCapturado: number;
    Diferencia: number;
    IniciosActivos: iInicioCaja[];
    CortesPendientes: number;
    UsuariosConMovimientosSinCorte: iUsuarioMovimiento[];
    PendientesDeCorte: number;
    UsuariosPendientes: iUsuarioMovimiento[];
    mensajes: string[];
    CajaEnCeroSoloTrasCuadre: boolean;
    DebeCuadrarseHoy: boolean;
}

// === Datos de Encabezado ===
export interface iInfoCajaChica {
    CajaChicaID: number;
    SucursalID: number;
    NombreSucursal: string;
    NombreCaja: string;
    FechaCorte: Date;
    FondoFijo: number;
}

// === Cortes de Usuario ===
export interface iCorteUsuario {
    UsuarioID: number;
    NombreUsuario: string;
    CorteID: number;
    Efectivo: number;
    Tarjeta: number;
    Transferencia: number;
    DepositoVentanilla: number;
    Egresos: number;
    MontoTeorico: number;
    Diferencia: number;
    Estado: 'PENDIENTE' | 'VALIDADO' | 'CON_DIFERENCIA';
}

export interface iUsuarioPendiente {
    UsuarioID: number;
    Nombre: string;
    NombreUsuario: string;
    InicioCajaID: number;
}

// === Egresos/Gastos ===
export interface iEgresoCajaChica {
    EgresoID: number;
    Concepto: string;
    Monto: number;
    Fecha: Date;
    Usuario?: string;
}

// === Depósitos a Banco ===
export interface iDepositoBanco {
    DepositoID: number;
    Monto: number;
    Fecha: Date;
    Referencia?: string;
}

// === Totales por Método de Pago ===
export interface iTotalesPorMetodo {
    TotalEfectivo: number;
    TotalTarjeta: number;
    TotalTransferencia: number;
    TotalDepositoVentanilla: number;
}

// === Cálculos Automáticos ===
export interface iCalculosCajaChica {
    SaldoInicial: number;
    IngresosUsuarios: iTotalesPorMetodo;
    TotalIngresos: number;
    TotalEgresos: number;
    TotalDepositosBanco: number;
    SaldoDisponible: number;
    EntregaAGeneral: number;
    SaldoFinal: number;
}

// === Precuadre Completo (Nueva estructura según especificación) ===
export interface iPrecuadreCajaChica {
    // Información general
    Info: iInfoCajaChica;
    
    // Totales por método (automático de cortes de usuario)
    TotalesPorMetodo: iTotalesPorMetodo;
    
    // Otros movimientos
    Egresos: iEgresoCajaChica[];
    DepositosBanco: iDepositoBanco[];
    
    // Cálculos automáticos
    Calculos: iCalculosCajaChica;
    
    // Detalle de cortes de usuario
    CortesUsuarios: iCorteUsuario[];
    
    // Control
    UsuariosPendientes: iUsuarioPendiente[];
    PendientesDeCorte: number;
    mensajes: string[];
}

// === Interface legacy para transición ===
export interface iPrecuadreCajaChicaLegacy {
    FondoInicial: number;
    Totales: {
        TotalIngresos: number;
        TotalEgresos: number;
        TotalEfectivo: number;
        TotalPagoConTarjeta: number;
        TotalTransferencia: number;
    };
    SaldoEsperado: number;
    SaldoReal: number;
    PendientesDeCorte: number;
    UsuariosPendientes: iUsuarioPendiente[];
    mensajes: string[];
}

// === Cuadrar Caja Chica ===
export interface iCuadrarCajaChica {
    SaldoReal: number;
    TotalEfectivoCapturado: number;
    TotalTarjetaCapturado: number;
    TotalTransferenciaCapturado: number;
    Observaciones?: string;
}

export interface iActualizarCapturables {
    Observaciones?: string;
    SaldoReal?: number;
    TotalEfectivoCapturado?: number;
    TotalTarjetaCapturado?: number;
    TotalTransferenciaCapturado?: number;
}

export interface iCancelarCajaChica {
    usuario: string;
    codigo: string;
    motivo: string;
}

export interface iCodigoCancelacion {
    id: number;
    codigo: string;
}

export interface iCajaChicaPorEstatus {
    CajaChicaID: number;
    Fecha: Date;
    FechaActualizacion: Date;
    FechaCierre: Date;
    TotalIngresos: string;
    TotalEgresos: string;
    TotalEfectivo: string;
    TotalPagoConTarjeta: string;
    TotalTransferencia: string;
    SaldoEsperado: string;
    SaldoReal: string;
    TotalEfectivoCapturado: string;
    TotalTarjetaCapturado: string;
    TotalTransferenciaCapturado: string;
    Diferencia: string;
    Observaciones?: string;
    FolioCierre: string;
    Estatus: string;
    UsuarioCuadre: {
        UsuarioID: number;
        NombreUsuario: string;
        Contrasena: string;
        EmpleadoID: number;
        SucursalID: number;
    };
}

// Interfaces legacy (mantener para compatibilidad)
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

export interface iResumenCajaChica {
    SaldoInicial: number;
    TotalGastos: number;
    TotalReposiciones: number;
    SaldoActual: number;
    CantidadGastos: number;
    Estado: string;
}
