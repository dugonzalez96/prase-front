import { z } from "zod";

const formasPago = ["Efectivo", "Transferencia", "Deposito", "Tarjeta"] as const;

export const editarInicioCajaSchema = z.object({
    MontoInicial: z.coerce.number().min(1, {
        message: 'El deber monto inicial ser mayor a 0'
    }),
    TotalEfectivo: z.coerce.number(),
    TotalTransferencia: z.coerce.number(),
    Estatus: z.string().min(1, {
        message: 'El estatus es requerido'
    }),
})

export const nuevoInicioCajaSchema = z.object({
    MontoInicial: z.number().min(1, { message: "El monto inicial es requerido" }),
    TotalEfectivo: z.number().min(1, { message: "El total de efectivo es requerido" }),
    TotalTransferencia: z.number().min(1, { message: "El total de transferencia es requerido" }),
    UsuarioID: z.number().min(1, { message: "El usuario es requerido" }),
    UsuarioAutorizoID: z.number(),
})

export const nuevoMovimientoSchema = z.object({
    TipoTransaccion: z.enum(["Ingreso", "Egreso"]),
    FormaPago: z.enum(formasPago),
    Monto: z.number().min(1, "El monto debe ser mayor a 0"),
    UsuarioCreoID: z.number(),
    CuentaBancariaID: z.number(),
    Descripcion: z.string().min(1, "La descripción es requerida"),
    UsuarioValidoID: z.number().optional()
}).refine((data) => {
    if (data.FormaPago !== "Efectivo" && !data.UsuarioValidoID) {
        return false;
    }
    return true;
}, {
    message: "El usuario validador es requerido para pagos que no son en efectivo",
    path: ["UsuarioValidoID"]
});

export const eliminarMovimientoSchema = z.object({
    codigo: z.string().min(1, "El código es requerido"),
    motivo: z.string().min(1, "El motivo es requerido")
})

export const corteCajaSchema = z.object({
    SaldoReal: z.number().min(0, "El saldo real es requerido"),
    TotalEfectivoCapturado: z.number().min(0, "El total de efectivo es requerido"),
    TotalTarjetaCapturado: z.number().min(0, "El total de tarjeta es requerido"),
    TotalTransferenciaCapturado: z.number().min(0, "El total de transferencia es requerido"),
    Observaciones: z.string().default(""),
}).refine((datos) => {
    const sumaTotales = datos.TotalEfectivoCapturado +
        datos.TotalTarjetaCapturado +
        datos.TotalTransferenciaCapturado;

    return Math.abs(sumaTotales - datos.SaldoReal) < 0.01; // Usamos una pequeña tolerancia para evitar problemas con decimales
}, {
    message: "La suma de los totales debe ser igual al saldo real",
    path: ["TotalEfectivoCapturado"] // El error se mostrará en el campo de efectivo
});

// Cortes del dia

export const ingresosSchema = z.object({
    TotalIngresos: z.number().min(0, { message: "El total de ingresos no puede ser negativo" }),
    TotalIngresosEfectivo: z.number().min(0, { message: "El total de ingresos en efectivo no puede ser negativo" }),
    TotalIngresosTarjeta: z.number().min(0, { message: "El total de ingresos en tarjeta no puede ser negativo" }),
    TotalIngresosTransferencia: z.number().min(0, { message: "El total de ingresos por transferencia no puede ser negativo" }),
});

export const egresosSchema = z.object({
    TotalEgresos: z.number().min(0, { message: "El total de egresos no puede ser negativo" }),
    TotalEgresosEfectivo: z.number().min(0, { message: "El total de egresos en efectivo no puede ser negativo" }),
    TotalEgresosTarjeta: z.number().min(0, { message: "El total de egresos en tarjeta no puede ser negativo" }),
    TotalEgresosTransferencia: z.number().min(0, { message: "El total de egresos por transferencia no puede ser negativo" }),
});

export const resumenGeneralSchema = z.object({
    TotalEfectivo: z.number().min(0, { message: "El total de efectivo no puede ser negativo" }),
    TotalPagoConTarjeta: z.number().min(0, { message: "El total de pago con tarjeta no puede ser negativo" }),
    TotalTransferencia: z.number().min(0, { message: "El total de transferencia no puede ser negativo" }),
    SaldoEsperado: z.number().min(0, { message: "El saldo esperado no puede ser negativo" }),
    SaldoReal: z.number().min(0, { message: "El saldo real no puede ser negativo" }),
    TotalEfectivoCapturado: z.number().min(0, { message: "El total de efectivo capturado no puede ser negativo" }),
    TotalTarjetaCapturado: z.number().min(0, { message: "El total de tarjeta capturado no puede ser negativo" }),
    TotalTransferenciaCapturado: z.number().min(0, { message: "El total de transferencia capturado no puede ser negativo" }),
    // Diferencia: (Fórmula: SaldoEsperado - SaldoReal) usando refines
    Diferencia: z.number(),
    Observaciones: z.string().optional(),
    Estatus: z.string().min(1, { message: "El estatus es requerido" }),
});

export const cierreCajaSchema = z.object({
    Ingresos: ingresosSchema,
    Egresos: egresosSchema,
    ResumenGeneral: resumenGeneralSchema,
});


export const CorteDelDiaSchema = z.object({
    TotalIngresos: z.number(),
    TotalIngresosEfectivo: z.number(),
    TotalIngresosTarjeta: z.number(),
    TotalIngresosTransferencia: z.number(),
    TotalEgresos: z.number(),
    TotalEgresosEfectivo: z.number(),
    TotalEgresosTarjeta: z.number(),
    TotalEgresosTransferencia: z.number(),
    TotalEfectivo: z.number(),
    TotalPagoConTarjeta: z.number(),
    TotalTransferencia: z.number(),
    SaldoEsperado: z.number(),
    SaldoReal: z.number(),
    TotalEfectivoCapturado: z.number(),
    TotalTarjetaCapturado: z.number(),
    TotalTransferenciaCapturado: z.number(),
    Diferencia: z.number(),
    Observaciones: z.string(),
    Estatus: z.string(),
});

// fin cortes del dia