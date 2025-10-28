import { z } from "zod";

export const registrarIngresoSchema = z.object({
    CajaGeneralID: z.number().min(1, "El ID de caja general es requerido"),
    Categoria: z.enum([
        'CORTE_USUARIO',
        'PAGO_POLIZA',
        'CIERRE_CAJA_CHICA',
        'TRANSFERENCIA_RECIBIDA',
        'OTRO_INGRESO'
    ]),
    Monto: z.number().min(1, "El monto debe ser mayor a 0"),
    Descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
    ReferenciaID: z.number().optional(),
    TipoReferencia: z.string().optional(),
    Comprobante: z.string().optional(),
    UsuarioRegistroID: z.number().min(1, "El usuario es requerido"),
    AutorizadoPorID: z.number().optional()
});

export const registrarEgresoSchema = z.object({
    CajaGeneralID: z.number().min(1, "El ID de caja general es requerido"),
    Categoria: z.enum([
        'REPOSICION_CAJA_CHICA',
        'DEPOSITO_BANCARIO',
        'GASTO_ADMINISTRATIVO',
        'RETIRO_AUTORIZADO',
        'PAGO_PROVEEDOR',
        'OTRO_EGRESO'
    ]),
    Monto: z.number().min(1, "El monto debe ser mayor a 0"),
    Descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
    ReferenciaID: z.number().optional(),
    TipoReferencia: z.string().optional(),
    Comprobante: z.string().optional(),
    UsuarioRegistroID: z.number().min(1, "El usuario es requerido"),
    AutorizadoPorID: z.number().min(1, "Los egresos requieren autorización de gerente")
});

export const desgloseDenominacionesSchema = z.object({
    billetes1000: z.number().min(0).default(0),
    billetes500: z.number().min(0).default(0),
    billetes200: z.number().min(0).default(0),
    billetes100: z.number().min(0).default(0),
    billetes50: z.number().min(0).default(0),
    billetes20: z.number().min(0).default(0),
    monedas: z.number().min(0).default(0)
});

export const precuadreGeneralSchema = z.object({
    CajaGeneralID: z.number().min(1, "El ID de caja general es requerido"),
    EfectivoContado: z.number().min(0, "El efectivo contado no puede ser negativo"),
    DesgloseDenominaciones: desgloseDenominacionesSchema.optional(),
    Observaciones: z.string().optional(),
    GerenteID: z.number().min(1, "El gerente es requerido")
}).refine((data) => {
    // Si hay desglose, debe sumar el efectivo contado
    if (data.DesgloseDenominaciones) {
        const total = 
            (data.DesgloseDenominaciones.billetes1000 * 1000) +
            (data.DesgloseDenominaciones.billetes500 * 500) +
            (data.DesgloseDenominaciones.billetes200 * 200) +
            (data.DesgloseDenominaciones.billetes100 * 100) +
            (data.DesgloseDenominaciones.billetes50 * 50) +
            (data.DesgloseDenominaciones.billetes20 * 20) +
            data.DesgloseDenominaciones.monedas;
        
        if (Math.abs(total - data.EfectivoContado) > 0.01) {
            return false;
        }
    }
    return true;
}, {
    message: "El desglose de denominaciones debe coincidir con el efectivo contado",
    path: ["DesgloseDenominaciones"]
});

export const cuadreGeneralSchema = z.object({
    CajaGeneralID: z.number().min(1, "El ID de caja general es requerido"),
    PrecuadreGeneralID: z.number().min(1, "El ID de precuadre es requerido"),
    SaldoFinalConfirmado: z.number().min(0, "El saldo final no puede ser negativo"),
    EfectivoADepositar: z.number().min(0, "El efectivo a depositar no puede ser negativo"),
    FondoFijoProximoDia: z.number().min(0, "El fondo fijo no puede ser negativo"),
    Ajustes: z.string().optional(),
    GerenteID: z.number().min(1, "El gerente es requerido"),
    AdminAutorizoID: z.number().optional()
}).refine((data) => {
    // El saldo final debe ser igual a efectivo a depositar + fondo fijo
    const suma = data.EfectivoADepositar + data.FondoFijoProximoDia;
    if (Math.abs(suma - data.SaldoFinalConfirmado) > 0.01) {
        return false;
    }
    return true;
}, {
    message: "El saldo final debe ser igual a la suma de efectivo a depositar y fondo fijo",
    path: ["SaldoFinalConfirmado"]
}).refine((data) => {
    // Si hay diferencias mayores a $100, requiere autorización de admin
    if (data.Ajustes && data.Ajustes.trim().length > 0 && !data.AdminAutorizoID) {
        return false;
    }
    return true;
}, {
    message: "Los ajustes requieren autorización de administrador",
    path: ["AdminAutorizoID"]
});
