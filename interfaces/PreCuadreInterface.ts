export interface iEntradaDetalle {
    hora: string;
    tipo: string;
    sucursalId: number;
    nombreSucursal: string;
    referencia: string;
    descripcion: string;
    monto: number;
}

export interface iEgresoDetalle {
    hora?: string;
    tipo: string;
    sucursalId?: number;
    nombreSucursal?: string;
    referencia: string;
    descripcion: string;
    monto: number;
}

export interface iEntradasDetalle {
    cortesCajaChica: iEntradaDetalle[];
    pagosPoliza: iEntradaDetalle[];
    transaccionesIngreso: iEntradaDetalle[];
}

export interface iEgresosDetalle {
    transaccionesEgreso: iEgresoDetalle[];
}

export interface iPreCuadreData {
    saldoInicial: number;
    totalEntradas: number;
    totalEgresos: number;
    saldoCalculado: number;
    diferencia: number;
}

export interface iVariacionVsPromedio {
    totalEntradasPct: number;
    totalEgresosPct: number;
    saldoCalculadoPct: number;
}

export interface iPromedioUltimosCuadres {
    diasConsiderados: number;
    totalEntradas: number;
    totalEgresos: number;
    saldoFinal: number;
}

export interface iAnalitica {
    ultimoCuadreFecha: string;
    ultimoCuadreSaldoFinal: number;
    promedioUltimosCuadres: iPromedioUltimosCuadres;
    variacionVsPromedio: iVariacionVsPromedio;
}

export interface iPreCuadreResponseData {
    filtros: {
        fecha: string;
    };
    preCuadre: iPreCuadreData;
    entradasDetalle: iEntradasDetalle;
    egresosDetalle: iEgresosDetalle;
    analitica: iAnalitica | null;
    puedeCuadrarHoy: boolean;
    yaCuadradoHoy: boolean;
    motivosBloqueo: string[];
}

export interface iPreCuadreResponse {
    success: boolean;
    data: iPreCuadreResponseData;
}
