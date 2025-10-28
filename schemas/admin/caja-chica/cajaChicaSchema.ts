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
