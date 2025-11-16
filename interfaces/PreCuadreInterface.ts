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

export interface iPreCuadreResponse {
    filtros: {
        fecha: string;
    };
    preCuadre: iPreCuadreData;
    entradasDetalle: iEntradasDetalle;
    egresosDetalle: iEgresosDetalle;
}
