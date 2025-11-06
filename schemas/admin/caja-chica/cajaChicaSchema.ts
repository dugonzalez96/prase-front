import { z } from "zod";

export const iniciarCajaChicaSchema = z.object({
    SaldoInicial: z.number().min(100, "El saldo inicial debe ser al menos $100"),
    LimiteMaximo: z.number().min(1000, "El límite máximo debe ser al menos $1,000"),
    UsuarioResponsableID: z.number().min(1, "El usuario responsable es requerido"),
    SucursalID: z.number().optional()
});

export const registrarGastoSchema = z.object({
    CajaChicaID: z.number().min(1, "El ID de caja chica es requerido"),
    Monto: z.number().min(1, "El monto debe ser mayor a 0"),
    Concepto: z.string().min(5, "El concepto debe tener al menos 5 caracteres"),
    Categoria: z.string().min(1, "La categoría es requerida"),
    Comprobante: z.string().optional(),
    UsuarioRegistroID: z.number().min(1, "El usuario es requerido"),
    GerenteAproboID: z.number().optional()
}).refine((data) => {
    // Si el monto es mayor a $500, requiere aprobación de gerente
    if (data.Monto > 500 && !data.GerenteAproboID) {
        return false;
    }
    return true;
}, {
    message: "Gastos mayores a $500 requieren aprobación de gerente",
    path: ["GerenteAproboID"]
}).refine((data) => {
    // Si el monto es mayor a $100, requiere comprobante
    if (data.Monto > 100 && (!data.Comprobante || data.Comprobante.trim().length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Gastos mayores a $100 requieren comprobante",
    path: ["Comprobante"]
});

export const precuadreCajaChicaSchema = z.object({
    CajaChicaID: z.number().min(1, "El ID de caja chica es requerido"),
    EfectivoContado: z.number().min(0, "El efectivo contado no puede ser negativo"),
    TotalComprobantes: z.number().min(0, "El total de comprobantes no puede ser negativo"),
    Observaciones: z.string().optional(),
    UsuarioID: z.number().min(1, "El usuario es requerido")
});

export const cuadreCajaChicaSchema = z.object({
    CajaChicaID: z.number().min(1, "El ID de caja chica es requerido"),
    PrecuadreID: z.number().min(1, "El ID de precuadre es requerido"),
    SaldoFinal: z.number().min(0, "El saldo final no puede ser negativo"),
    Ajustes: z.string().optional(),
    UsuarioID: z.number().min(1, "El usuario es requerido"),
    GerenteValidoID: z.number().optional()
}).refine((data) => {
    // Si hay ajustes, requiere aprobación de gerente
    if (data.Ajustes && data.Ajustes.trim().length > 0 && !data.GerenteValidoID) {
        return false;
    }
    return true;
}, {
    message: "Los ajustes requieren aprobación de gerente",
    path: ["GerenteValidoID"]
});

export const solicitarReposicionSchema = z.object({
    CajaChicaID: z.number().min(1, "El ID de caja chica es requerido"),
    Monto: z.number().min(100, "El monto mínimo de reposición es $100"),
    Justificacion: z.string().min(10, "La justificación debe tener al menos 10 caracteres"),
    UsuarioSolicitaID: z.number().min(1, "El usuario es requerido"),
    GerenteAutorizaID: z.number().min(1, "El gerente autorizador es requerido")
});

// === NUEVOS SCHEMAS PARA REFACTOR ===

/**
 * Schema para cuadrar caja chica
 * POST /caja-chica/cuadrar/{id}
 */
export const cuadrarCajaChicaSchema = z.object({
    SaldoReal: z.number({
        required_error: "El saldo real es requerido",
        invalid_type_error: "El saldo real debe ser un número"
    }).min(0, "El saldo real no puede ser negativo"),
    
    TotalEfectivoCapturado: z.number({
        required_error: "El total de efectivo es requerido",
        invalid_type_error: "El total de efectivo debe ser un número"
    }).min(0, "El total de efectivo no puede ser negativo"),
    
    TotalTarjetaCapturado: z.number({
        required_error: "El total de tarjeta es requerido",
        invalid_type_error: "El total de tarjeta debe ser un número"
    }).min(0, "El total de tarjeta no puede ser negativo"),
    
    TotalTransferenciaCapturado: z.number({
        required_error: "El total de transferencia es requerido",
        invalid_type_error: "El total de transferencia debe ser un número"
    }).min(0, "El total de transferencia no puede ser negativo"),
    
    Observaciones: z.string().optional()
}).refine((data) => {
    // Validar que la suma de los totales sea igual al saldo real
    const suma = data.TotalEfectivoCapturado + data.TotalTarjetaCapturado + data.TotalTransferenciaCapturado;
    return Math.abs(suma - data.SaldoReal) < 0.01; // Tolerancia de 1 centavo por redondeo
}, {
    message: "La suma de efectivo, tarjeta y transferencia debe ser igual al saldo real",
    path: ["SaldoReal"]
});

/**
 * Schema para actualizar campos capturables antes del cierre
 * PATCH /caja-chica/{id}/capturables
 */
export const actualizarCapturablesSchema = z.object({
    Observaciones: z.string().optional(),
    SaldoReal: z.number().min(0, "El saldo real no puede ser negativo").optional(),
    TotalEfectivoCapturado: z.number().min(0, "El total de efectivo no puede ser negativo").optional(),
    TotalTarjetaCapturado: z.number().min(0, "El total de tarjeta no puede ser negativo").optional(),
    TotalTransferenciaCapturado: z.number().min(0, "El total de transferencia no puede ser negativo").optional()
}).refine((data) => {
    // Al menos un campo debe estar presente
    const hasCampos = data.Observaciones !== undefined || 
                      data.SaldoReal !== undefined || 
                      data.TotalEfectivoCapturado !== undefined ||
                      data.TotalTarjetaCapturado !== undefined ||
                      data.TotalTransferenciaCapturado !== undefined;
    return hasCampos;
}, {
    message: "Debe actualizar al menos un campo",
    path: ["Observaciones"]
});

/**
 * Schema para cancelar caja chica
 * PATCH /caja-chica/{id}/cancelar
 */
export const cancelarCajaChicaSchema = z.object({
    usuario: z.string({
        required_error: "El nombre de usuario es requerido",
        invalid_type_error: "El nombre de usuario debe ser texto"
    }).min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    
    codigo: z.string({
        required_error: "El código de cancelación es requerido",
        invalid_type_error: "El código de cancelación debe ser texto"
    }).min(6, "El código debe tener al menos 6 caracteres").max(10, "El código no puede exceder 10 caracteres"),
    
    motivo: z.string({
        required_error: "El motivo de cancelación es requerido",
        invalid_type_error: "El motivo debe ser texto"
    }).min(10, "El motivo debe tener al menos 10 caracteres").max(500, "El motivo no puede exceder 500 caracteres")
});
