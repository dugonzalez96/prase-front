"use server";

import { 
    iCajaChica, 
    iMovimientoCajaChica, 
    iPrecuadreCajaChica,
    iCuadreCajaChica,
    iResumenCajaChica,
    iPostGastoCajaChica,
    iPostPrecuadreCajaChica,
    iPostCuadreCajaChica
} from "@/interfaces/CajaChicaInterface";

// Mock data para caja chica activa
const mockCajaChicaActiva: iCajaChica = {
    CajaChicaID: 1,
    Fecha: new Date("2025-10-26"),
    SaldoInicial: 5000,
    SaldoActual: 2650,
    LimiteMaximo: 5000,
    Estado: 'ACTIVA',
    UsuarioResponsableID: 5,
    UsuarioResponsable: {
        UsuarioID: 5,
        NombreUsuario: "Juan Pérez"
    },
    SucursalID: 1
};

// Mock data para movimientos de caja chica
const mockMovimientosCajaChica: iMovimientoCajaChica[] = [
    {
        MovimientoCajaChicaID: 1,
        CajaChicaID: 1,
        TipoMovimiento: 'GASTO',
        Monto: "500.00",
        Concepto: "Compra de material de papelería",
        Categoria: "Papelería",
        Comprobante: "TICKET-001.pdf",
        FechaMovimiento: new Date("2025-10-26T10:30:00"),
        UsuarioRegistroID: 5,
        UsuarioRegistro: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        }
    },
    {
        MovimientoCajaChicaID: 2,
        CajaChicaID: 1,
        TipoMovimiento: 'GASTO',
        Monto: "850.00",
        Concepto: "Productos de limpieza y mantenimiento",
        Categoria: "Limpieza",
        Comprobante: "TICKET-002.pdf",
        FechaMovimiento: new Date("2025-10-26T12:45:00"),
        UsuarioRegistroID: 5,
        UsuarioRegistro: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        }
    },
    {
        MovimientoCajaChicaID: 3,
        CajaChicaID: 1,
        TipoMovimiento: 'GASTO',
        Monto: "1000.00",
        Concepto: "Transporte de documentos urgentes",
        Categoria: "Transporte",
        FechaMovimiento: new Date("2025-10-26T15:20:00"),
        UsuarioRegistroID: 5,
        UsuarioRegistro: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        }
    }
];

// Mock data para historial
const mockHistorialCajaChica: iCajaChica[] = [
    {
        CajaChicaID: 2,
        Fecha: new Date("2025-10-25"),
        SaldoInicial: 5000,
        SaldoActual: 0,
        LimiteMaximo: 5000,
        Estado: 'CERRADA',
        UsuarioResponsableID: 5,
        UsuarioResponsable: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        },
        SucursalID: 1
    },
    {
        CajaChicaID: 3,
        Fecha: new Date("2025-10-24"),
        SaldoInicial: 5000,
        SaldoActual: 0,
        LimiteMaximo: 5000,
        Estado: 'CERRADA',
        UsuarioResponsableID: 5,
        UsuarioResponsable: {
            UsuarioID: 5,
            NombreUsuario: "Juan Pérez"
        },
        SucursalID: 1
    }
];

export const getCajaChicaActiva = async (usuarioId: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockCajaChicaActiva;
    } catch (error) {
        console.log('Error al obtener caja chica activa: ', error);
        return null;
    }
}

export const getMovimientosCajaChica = async (cajaChicaId: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return mockMovimientosCajaChica;
    } catch (error) {
        console.log('Error al obtener movimientos de caja chica: ', error);
        return null;
    }
}

export const getResumenCajaChica = async (cajaChicaId: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const resumen: iResumenCajaChica = {
            SaldoInicial: 5000,
            TotalGastos: 2350,
            TotalReposiciones: 0,
            SaldoActual: 2650,
            CantidadGastos: 3,
            Estado: 'ACTIVA'
        };
        
        return resumen;
    } catch (error) {
        console.log('Error al obtener resumen de caja chica: ', error);
        return null;
    }
}

export const registrarGasto = async (body: iPostGastoCajaChica) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Registrando gasto:', body);
        
        return {
            success: true,
            message: 'Gasto registrado correctamente',
            data: {
                MovimientoCajaChicaID: Math.floor(Math.random() * 1000),
                ...body,
                FechaMovimiento: new Date()
            }
        };
    } catch (error) {
        console.log('Error al registrar gasto: ', error);
        return {
            success: false,
            message: 'Error al registrar el gasto'
        };
    }
}

export const crearPrecuadreCajaChica = async (body: iPostPrecuadreCajaChica) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const saldoEsperado = 2650;
        const diferencia = saldoEsperado - body.EfectivoContado;
        
        console.log('Creando precuadre:', body);
        
        return {
            success: true,
            message: 'Precuadre creado correctamente',
            data: {
                PrecuadreID: Math.floor(Math.random() * 1000),
                SaldoEsperado: saldoEsperado,
                Diferencia: diferencia,
                ...body,
                FechaPrecuadre: new Date()
            }
        };
    } catch (error) {
        console.log('Error al crear precuadre: ', error);
        return {
            success: false,
            message: 'Error al crear el precuadre'
        };
    }
}

export const crearCuadreCajaChica = async (body: iPostCuadreCajaChica) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Creando cuadre:', body);
        
        return {
            success: true,
            message: 'Cuadre realizado correctamente',
            data: {
                CuadreID: Math.floor(Math.random() * 1000),
                DiferenciaFinal: 0,
                EstadoFinal: 'CUADRADA',
                MontoTransferidoCajaGeneral: body.SaldoFinal,
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

export const getHistorialCajaChica = async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockHistorialCajaChica;
    } catch (error) {
        console.log('Error al obtener historial: ', error);
        return null;
    }
}

export const solicitarReposicion = async (cajaChicaId: number, monto: number, justificacion: string, usuarioId: number, gerenteId: number) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            success: true,
            message: 'Reposición solicitada correctamente',
            data: {
                MovimientoCajaChicaID: Math.floor(Math.random() * 1000),
                TipoMovimiento: 'REPOSICION',
                Monto: monto,
                FechaSolicitud: new Date()
            }
        };
    } catch (error) {
        console.log('Error al solicitar reposición: ', error);
        return {
            success: false,
            message: 'Error al solicitar la reposición'
        };
    }
}
