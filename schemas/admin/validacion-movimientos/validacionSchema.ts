import { z } from "zod";

export const validarMovimientoSchema = z.object({
    TransaccionID: z.number().min(1, "El ID de transacción es requerido"),
    UsuarioValidoID: z.number().min(1, "El ID de usuario validador es requerido"),
    Aprobado: z.boolean(),
    Motivo: z.string().optional()
}).refine((data) => {
    // Si se rechaza, el motivo es obligatorio
    if (!data.Aprobado && (!data.Motivo || data.Motivo.trim().length === 0)) {
        return false;
    }
    return true;
}, {
    message: "El motivo es requerido al rechazar un movimiento",
    path: ["Motivo"]
});

export const rechazarMovimientoSchema = z.object({
    TransaccionID: z.number().min(1, "El ID de transacción es requerido"),
    UsuarioValidoID: z.number().min(1, "El ID de usuario validador es requerido"),
    Motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres")
});

export const filtrosValidacionSchema = z.object({
    estado: z.enum(['todos', 'pendiente', 'validado', 'rechazado']).optional(),
    formaPago: z.string().optional(),
    fechaInicio: z.date().optional(),
    fechaFin: z.date().optional(),
    usuarioID: z.number().optional()
});
