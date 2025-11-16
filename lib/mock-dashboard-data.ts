/**
 * DATOS DE PRUEBA PARA DESARROLLO
 * 
 * Usar estos datos para testear los componentes localmente
 * sin necesidad de un backend completo
 */

import { iCajaGeneralDashboard } from "@/interfaces/CajaGeneralDashboardInterface";

export const MOCK_DASHBOARD_DATA: iCajaGeneralDashboard = {
    filtros: {
        fecha: "2025-11-15",
    },
    resumen: {
        saldoInicial: 0,
        totalEntradas: 18550,
        totalEgresos: 5000,
        saldoCalculado: 13550,
        estadoCuadre: "PRE_CUADRE",
    },
    entradas: [
        {
            hora: "18:12",
            tipo: "CORTE_CAJA_CHICA",
            sucursalId: 1,
            nombreSucursal: "Tepic matriz",
            referencia: "CC-20251115-040",
            descripcion: "Corte caja chica Tepic matriz",
            monto: 18550,
        },
        {
            hora: "15:30",
            tipo: "PAGO_POLIZA",
            sucursalId: 2,
            nombreSucursal: "Sucursal Sur",
            referencia: "POL-20251115-001",
            descripcion: "Pago de póliza #12345",
            monto: 5000,
        },
    ],
    egresos: [
        {
            hora: "10:00",
            tipo: "REPOSICION_CAJA_CHICA",
            sucursalId: 1,
            nombreSucursal: "Tepic matriz",
            referencia: "REP-20251115-001",
            descripcion: "Reposición de caja chica",
            monto: 3000,
        },
        {
            hora: "14:30",
            tipo: "GASTO_ADMINISTRATIVO",
            sucursalId: 2,
            nombreSucursal: "Sucursal Sur",
            referencia: "GA-20251115-001",
            descripcion: "Gasto administrativo",
            monto: 2000,
        },
    ],
    entradasDetalle: {
        cortesCajaChica: [
            {
                hora: "18:12",
                tipo: "CORTE_CAJA_CHICA",
                sucursalId: 1,
                nombreSucursal: "Tepic matriz",
                referencia: "CC-20251115-040",
                descripcion: "Corte caja chica Tepic matriz",
                monto: 18550,
            },
        ],
        pagosPoliza: [
            {
                hora: "15:30",
                tipo: "PAGO_POLIZA",
                sucursalId: 2,
                nombreSucursal: "Sucursal Sur",
                referencia: "POL-20251115-001",
                descripcion: "Pago de póliza #12345",
                monto: 5000,
            },
        ],
        transaccionesIngreso: [],
    },
    egresosDetalle: {
        transaccionesEgreso: [
            {
                hora: "10:00",
                tipo: "REPOSICION_CAJA_CHICA",
                sucursalId: 1,
                nombreSucursal: "Tepic matriz",
                referencia: "REP-20251115-001",
                descripcion: "Reposición de caja chica",
                monto: 3000,
            },
            {
                hora: "14:30",
                tipo: "GASTO_ADMINISTRATIVO",
                sucursalId: 2,
                nombreSucursal: "Sucursal Sur",
                referencia: "GA-20251115-001",
                descripcion: "Gasto administrativo",
                monto: 2000,
            },
        ],
    },
    cortesUsuarios: [
        {
            usuario: "admin",
            usuarioId: 4,
            sucursalId: 1,
            nombreSucursal: "Tepic matriz",
            fechaHoraCorte: "2025-11-15T18:11:59.000Z",
            montoCorte: 21550,
            estadoCajaChica: "Cerrado",
            estadoCajaGeneral: "Pendiente",
        },
        {
            usuario: "gerente",
            usuarioId: 5,
            sucursalId: 2,
            nombreSucursal: "Sucursal Sur",
            fechaHoraCorte: "2025-11-15T18:05:00.000Z",
            montoCorte: 15000,
            estadoCajaChica: "Cerrado",
            estadoCajaGeneral: "Cuadrado",
        },
    ],
    iniciosUsuarios: [
        {
            usuario: "admin",
            usuarioId: 4,
            sucursalId: 1,
            nombreSucursal: "Tepic matriz",
            fechaInicio: "2025-11-15T18:10:55.000Z",
            montoInicio: 20050,
            estado: "Cerrado",
        },
        {
            usuario: "gerente",
            usuarioId: 5,
            sucursalId: 2,
            nombreSucursal: "Sucursal Sur",
            fechaInicio: "2025-11-15T08:00:00.000Z",
            montoInicio: 15000,
            estado: "Cerrado",
        },
    ],
    preCuadre: {
        saldoInicial: 0,
        totalEntradas: 18550,
        totalEgresos: 5000,
        saldoCalculado: 13550,
        diferencia: 0,
    },
    historialCuadres: [],
};

/**
 * Usar en componentes Client para testear:
 * 
 * import { MOCK_DASHBOARD_DATA } from "@/lib/mock-data";
 * 
 * export function CajaGeneralDashboardClient() {
 *   // En desarrollo:
 *   const data = process.env.NODE_ENV === 'development' ? MOCK_DASHBOARD_DATA : data;
 *   
 *   return <CajaGeneralDashboardClient data={data} />
 * }
 */
