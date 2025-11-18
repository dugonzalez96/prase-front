"use server";

import { 
    iCajaGeneral,
    iMovimientoCajaGeneral,
    iPrecuadreCajaGeneral,
    iCuadreCajaGeneral,
    iResumenCajaGeneral,
    iCorteUsuarioResumen,
    iPostMovimientoCajaGeneral,
    iPostPrecuadreCajaGeneral,
    iPostCuadreCajaGeneral
} from "@/interfaces/CajaGeneralInterface";

// Mock data para caja general activa
const mockCajaGeneralActiva: iCajaGeneral = {
    CajaGeneralID: 1,
    Fecha: new Date("2025-10-26"),
    SaldoInicial: 15000,
    TotalIngresos: 25430,
    TotalEgresos: 8200,
    SaldoFinal: 32230,
    SaldoEsperado: 32230,
    Diferencia: 0,
    Estado: 'ABIERTA',
    SucursalID: 1,
    GerenteResponsableID: 2,
    GerenteResponsable: {
        UsuarioID: 2,
        NombreUsuario: "Admin Principal"
    }
};

// Mock data para resumen de cortes de usuarios
const mockCortesUsuarios: iCorteUsuarioResumen[] = [
    {
        CorteUsuarioID: 1,
        NombreUsuario: "Juan Pérez",
        TotalEfectivo: 5200,
        Estado: 'CERRADO',
        FechaCorte: new Date("2025-10-26T18:00:00")
    },
    {
        CorteUsuarioID: 2,
        NombreUsuario: "María García",
        TotalEfectivo: 8100,
        Estado: 'CERRADO',
        FechaCorte: new Date("2025-10-26T18:15:00")
    },
    {
        CorteUsuarioID: 3,
        NombreUsuario: "Carlos López",
        TotalEfectivo: 4130,
        Estado: 'PENDIENTE',
        FechaCorte: new Date("2025-10-26T17:30:00")
    },
    {
        CorteUsuarioID: 4,
        NombreUsuario: "Ana Martínez",
        TotalEfectivo: 6200,
        Estado: 'CERRADO',
        FechaCorte: new Date("2025-10-26T18:30:00")
    },
    {
        CorteUsuarioID: 5,
        NombreUsuario: "Luis Hernández",
        TotalEfectivo: 1800,
        Estado: 'PENDIENTE',
        FechaCorte: new Date("2025-10-26T17:45:00")
    }
];

// Mock data para movimientos de caja general
const mockMovimientosCajaGeneral: iMovimientoCajaGeneral[] = [
    {
        MovimientoCajaGeneralID: 1,
        CajaGeneralID: 1,
        TipoMovimiento: 'INGRESO',
        Categoria: 'CORTE_USUARIO',
        Monto: "5200.00",
        Descripcion: "Corte de caja - Juan Pérez",
        ReferenciaID: 1,
        TipoReferencia: 'CORTE_USUARIO',
        FechaMovimiento: new Date("2025-10-26T18:00:00"),
        UsuarioRegistroID: 2,
        UsuarioRegistro: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        }
    },
    {
        MovimientoCajaGeneralID: 2,
        CajaGeneralID: 1,
        TipoMovimiento: 'INGRESO',
        Categoria: 'CORTE_USUARIO',
        Monto: "8100.00",
        Descripcion: "Corte de caja - María García",
        ReferenciaID: 2,
        TipoReferencia: 'CORTE_USUARIO',
        FechaMovimiento: new Date("2025-10-26T18:15:00"),
        UsuarioRegistroID: 2,
        UsuarioRegistro: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        }
    },
    {
        MovimientoCajaGeneralID: 3,
        CajaGeneralID: 1,
        TipoMovimiento: 'INGRESO',
        Categoria: 'PAGO_POLIZA',
        Monto: "4500.00",
        Descripcion: "Pago directo de cliente por póliza renovación",
        FechaMovimiento: new Date("2025-10-26T14:30:00"),
        UsuarioRegistroID: 5,
        UsuarioRegistro: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        },
        AutorizadoPorID: 2,
        AutorizadoPor: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        }
    },
    {
        MovimientoCajaGeneralID: 4,
        CajaGeneralID: 1,
        TipoMovimiento: 'INGRESO',
        Categoria: 'CIERRE_CAJA_CHICA',
        Monto: "2650.00",
        Descripcion: "Cierre de caja chica del día",
        ReferenciaID: 1,
        TipoReferencia: 'CAJA_CHICA',
        FechaMovimiento: new Date("2025-10-26T17:00:00"),
        UsuarioRegistroID: 5,
        UsuarioRegistro: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        }
    },
    {
        MovimientoCajaGeneralID: 5,
        CajaGeneralID: 1,
        TipoMovimiento: 'EGRESO',
        Categoria: 'REPOSICION_CAJA_CHICA',
        Monto: "2000.00",
        Descripcion: "Reposición de caja chica para próximo día",
        ReferenciaID: 1,
        TipoReferencia: 'CAJA_CHICA',
        FechaMovimiento: new Date("2025-10-26T08:00:00"),
        UsuarioRegistroID: 2,
        UsuarioRegistro: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        },
        AutorizadoPorID: 2,
        AutorizadoPor: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        }
    },
    {
        MovimientoCajaGeneralID: 6,
        CajaGeneralID: 1,
        TipoMovimiento: 'EGRESO',
        Categoria: 'DEPOSITO_BANCARIO',
        Monto: "5000.00",
        Descripcion: "Depósito bancario BBVA",
        Comprobante: "DEPOSITO-001.pdf",
        FechaMovimiento: new Date("2025-10-26T12:00:00"),
        UsuarioRegistroID: 2,
        UsuarioRegistro: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        },
        AutorizadoPorID: 2,
        AutorizadoPor: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        }
    },
    {
        MovimientoCajaGeneralID: 7,
        CajaGeneralID: 1,
        TipoMovimiento: 'EGRESO',
        Categoria: 'GASTO_ADMINISTRATIVO',
        Monto: "1200.00",
        Descripcion: "Pago de servicios de oficina",
        Comprobante: "FACTURA-001.pdf",
        FechaMovimiento: new Date("2025-10-26T10:30:00"),
        UsuarioRegistroID: 6,
        UsuarioRegistro: {
            UsuarioID: 6,
            NombreUsuario: "María García"
        },
        AutorizadoPorID: 2,
        AutorizadoPor: {
            UsuarioID: 2,
            NombreUsuario: "Admin Principal"
        }
    }
];

import { iCajaGeneralDashboard } from "@/interfaces/CajaGeneralDashboardInterface";

/**
 * Obtiene los datos del dashboard de caja general para una fecha específica
 * GET /caja-general/dashboard?fecha=2025-11-15
 * GET /caja-general/dashboard?fecha=2025-11-15&sucursalId=1
 */
export async function getCajaGeneralDashboard(fecha: string, sucursalId?: number): Promise<iCajaGeneralDashboard> {
    try {
        let url = `${process.env.API_URL}/caja-general/dashboard?fecha=${fecha}`;
        if (sucursalId) {
            url += `&sucursalId=${sucursalId}`;
        }
        
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );
        // console.log("🚀 ~ getCajaGeneralDashboard ~ response:", response)

        if (!response.ok) {
            throw new Error(`Error al obtener datos del dashboard: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en getCajaGeneralDashboard:', error);
        throw error;
    }
}


export const getCajaGeneralActiva = async (sucursalId?: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockCajaGeneralActiva;
    } catch (error) {
        console.log('Error al obtener caja general activa: ', error);
        return null;
    }
}

export const getResumenCajaGeneral = async (cajaGeneralId: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const cortesValidados = mockCortesUsuarios.filter(c => c.Estado === 'CERRADO').length;
        const cortesPendientes = mockCortesUsuarios.filter(c => c.Estado === 'PENDIENTE').length;
        
        const resumen: iResumenCajaGeneral = {
            SaldoInicial: 15000,
            TotalIngresos: 25430,
            TotalEgresos: 8200,
            SaldoActual: 32230,
            CortesValidados: cortesValidados,
            CortesPendientes: cortesPendientes,
            Estado: 'ABIERTA'
        };
        
        return resumen;
    } catch (error) {
        console.log('Error al obtener resumen de caja general: ', error);
        return null;
    }
}

export const getCortesUsuarios = async (fecha?: Date) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return mockCortesUsuarios;
    } catch (error) {
        console.log('Error al obtener cortes de usuarios: ', error);
        return null;
    }
}

export const getMovimientosCajaGeneral = async (cajaGeneralId: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return mockMovimientosCajaGeneral;
    } catch (error) {
        console.log('Error al obtener movimientos de caja general: ', error);
        return null;
    }
}

export const registrarIngreso = async (body: iPostMovimientoCajaGeneral) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Registrando ingreso:', body);
        
        return {
            success: true,
            message: 'Ingreso registrado correctamente',
            data: {
                MovimientoCajaGeneralID: Math.floor(Math.random() * 1000),
                ...body,
                TipoMovimiento: 'INGRESO',
                FechaMovimiento: new Date()
            }
        };
    } catch (error) {
        console.log('Error al registrar ingreso: ', error);
        return {
            success: false,
            message: 'Error al registrar el ingreso'
        };
    }
}

export const registrarEgreso = async (body: iPostMovimientoCajaGeneral) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Registrando egreso:', body);
        
        return {
            success: true,
            message: 'Egreso registrado correctamente',
            data: {
                MovimientoCajaGeneralID: Math.floor(Math.random() * 1000),
                ...body,
                TipoMovimiento: 'EGRESO',
                FechaMovimiento: new Date()
            }
        };
    } catch (error) {
        console.log('Error al registrar egreso: ', error);
        return {
            success: false,
            message: 'Error al registrar el egreso'
        };
    }
}

export const generarPrecuadreCajaGeneral = async (body: iPostPrecuadreCajaGeneral) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const totalCortesUsuarios = mockCortesUsuarios
            .filter(c => c.Estado === 'CERRADO')
            .reduce((sum, c) => sum + c.TotalEfectivo, 0);
        
        const totalIngresosDirectos = 7150; // Pagos directos + caja chica
        const totalEgresos = 8200;
        const saldoEsperado = 15000 + totalCortesUsuarios + totalIngresosDirectos - totalEgresos;
        const diferencia = saldoEsperado - body.EfectivoContado;
        
        console.log('Generando precuadre:', body);
        
        return {
            success: true,
            message: 'Precuadre generado correctamente',
            data: {
                PrecuadreGeneralID: Math.floor(Math.random() * 1000),
                TotalCortesUsuarios: totalCortesUsuarios,
                TotalIngresosDirectos: totalIngresosDirectos,
                TotalEgresos: totalEgresos,
                SaldoEsperado: saldoEsperado,
                Diferencia: diferencia,
                ...body,
                FechaPrecuadre: new Date()
            }
        };
    } catch (error) {
        console.log('Error al generar precuadre: ', error);
        return {
            success: false,
            message: 'Error al generar el precuadre'
        };
    }
}

export const crearCuadreCajaGeneral = async (body: iPostCuadreCajaGeneral) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const diferenciaFinal = body.SaldoFinalConfirmado - (body.EfectivoADepositar + body.FondoFijoProximoDia);
        
        console.log('Creando cuadre:', body);
        
        return {
            success: true,
            message: 'Cuadre realizado correctamente',
            data: {
                CuadreGeneralID: Math.floor(Math.random() * 1000),
                DiferenciaFinal: diferenciaFinal,
                EstadoFinal: Math.abs(diferenciaFinal) <= 100 ? 'CUADRADA' : 'CON_DIFERENCIA',
                ...body,
                FechaCuadre: new Date()
            }
        };
    } catch (error) {
        console.log('Error al crear cuadre: ', error);
        return {
            success: false,
            message: 'Error al realizar el cuadre'
        };
    }
}

export const getHistorialCajaGeneral = async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const historial: iCajaGeneral[] = [
            {
                CajaGeneralID: 2,
                Fecha: new Date("2025-10-25"),
                SaldoInicial: 15000,
                TotalIngresos: 28500,
                TotalEgresos: 11250,
                SaldoFinal: 32250,
                SaldoEsperado: 32250,
                Diferencia: 0,
                Estado: 'CERRADA',
                GerenteResponsableID: 2,
                GerenteResponsable: {
                    UsuarioID: 2,
                    NombreUsuario: "Admin Principal"
                }
            },
            {
                CajaGeneralID: 3,
                Fecha: new Date("2025-10-24"),
                SaldoInicial: 15000,
                TotalIngresos: 31200,
                TotalEgresos: 15500,
                SaldoFinal: 30700,
                SaldoEsperado: 30750,
                Diferencia: -50,
                Estado: 'CERRADA',
                GerenteResponsableID: 2,
                GerenteResponsable: {
                    UsuarioID: 2,
                    NombreUsuario: "Admin Principal"
                }
            }
        ];
        
        return historial;
    } catch (error) {
        console.log('Error al obtener historial: ', error);
        return null;
    }
}

/**
 * Obtiene el pre-cuadre de caja general para una fecha específica
 * GET /caja-general/pre-cuadre?fecha=2025-11-15
 * GET /caja-general/pre-cuadre?fecha=2025-11-15&sucursalId=1
 */
export async function getPreCuadreCajaGeneral(fecha: string, sucursalId?: number) {
    try {
        let url = `${process.env.API_URL}/caja-general/pre-cuadre?fecha=${fecha}`;
        if (sucursalId) {
            url += `&sucursalId=${sucursalId}`;
        }
        
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(`Error al obtener pre-cuadre: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en getPreCuadreCajaGeneral:', error);
        throw error;
    }
}

/**
 * Registra un movimiento en caja general
 * POST /caja-general/movimientos
 */
export async function registrarMovimientoCajaGeneral(body: {
    tipoTransaccion: string;
    formaPago: string;
    monto: number;
    descripcion: string;
    usuarioCreoId: number;
    cuentaBancariaId: number | null;
    fechaTransaccion: string;
}) {
    try {
        const response = await fetch(
            `${process.env.API_URL}/caja-general/movimientos`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(`Error al registrar movimiento: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en registrarMovimientoCajaGeneral:', error);
        throw error;
    }
}

/**
 * Cuadra la caja general
 * POST /caja-general/cuadrar
 */
export async function cuadrarCajaGeneral(body: {
    fecha: string;
    sucursalId: number;
    usuarioCuadreId: number;
    observaciones: string;
    saldoReal: number;
    totalEfectivoCapturado: number;
    totalTarjetaCapturado: number;
    totalTransferenciaCapturado: number;
}) {
    try {
        const response = await fetch(
            `${process.env.API_URL}/caja-general/cuadrar`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(`Error al cuadrar caja: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en cuadrarCajaGeneral:', error);
        throw error;
    }
}
