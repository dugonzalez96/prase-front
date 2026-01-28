// Interfaces para el dashboard de Caja General

export interface iCajaGeneralDashboard {
  success: boolean;
  data: {
    filtros: {
      fecha: string;
    };
    resumen: {
      saldoInicial: number;
      totalEntradas: number;
      totalEgresos: number;
      saldoCalculado: number;
      estadoCuadre: string;
    };
    entradas: iMovimientoCajaGeneralDashboard[];
    egresos: iMovimientoCajaGeneralDashboard[];
    entradasDetalle: {
      cortesCajaChica: iCortesCajaChicaDetalle[];
      pagosPoliza: iPagosPolizaDetalle[];
      transaccionesIngreso: iTransaccionIngresoDetalle[];
    };
    egresosDetalle: {
      transaccionesEgreso: iTransaccionEgresoDetalle[];
    };
    cortesUsuarios: iCorteUsuarioDashboard[];
    iniciosUsuarios: iInicioUsuarioDashboard[];
    preCuadre: {
      saldoInicial: number;
      totalEntradas: number;
      totalEgresos: number;
      saldoCalculado: number;
      diferencia: number;
      totalEfectivoCapturado: number;
      totalTarjetaCapturado: number;
      totalTransferenciaCapturado: number;
    };
    historialCuadres: iHistorialCuadre[];
  };
}

export interface iMovimientoCajaGeneralDashboard {
  hora: string;
  tipo: string;
  sucursalId: number;
  nombreSucursal: string;
  referencia: string;
  descripcion: string;
  monto: number;
}

export interface iCortesCajaChicaDetalle extends iMovimientoCajaGeneralDashboard {}

export interface iPagosPolizaDetalle extends iMovimientoCajaGeneralDashboard {
  polizaId?: number;
  numeroPoliza?: string;
}

export interface iTransaccionIngresoDetalle extends iMovimientoCajaGeneralDashboard {
  tipoTransaccion?: string;
}

export interface iTransaccionEgresoDetalle extends iMovimientoCajaGeneralDashboard {
  tipoTransaccion?: string;
}

export interface iCorteUsuarioDashboard {
  usuario: string;
  usuarioId: number;
  sucursalId: number;
  nombreSucursal: string;
  fechaHoraCorte: string;
  montoCorte: number;
  efectivoEntregado?: number;
  transferencias?: number;
  depositos?: number;
  estadoCajaChica: string;
  estadoCajaGeneral: string;
}

export interface iInicioUsuarioDashboard {
  usuario: string;
  usuarioId: number;
  sucursalId: number;
  nombreSucursal: string;
  fechaInicio: string;
  montoInicio: number;
  estado: string;
}

export interface iHistorialCuadre {
  cajaGeneralId: number;
  fecha: string;
  sucursalId: number;
  nombreSucursal: string;
  saldoInicial: number;
  totalEntradas: number;
  totalEgresos: number;
  saldoFinal: number;
  usuarioCuadre: string;
  estatus: string;
  diferencia : number;
  observaciones: string;
  entrego: number;
}
