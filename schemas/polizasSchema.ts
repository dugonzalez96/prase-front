import { z } from "zod";

export const editarPolizaSchema = z.object({
    EstadoPoliza: z.enum(["PERIODO DE GRACIA", "ACTIVA", "PENDIENTE"]),
    PrimaTotal: z.coerce.number().min(1, {
        message: "La prima total es requerida"
    }),
    ClienteID: z.number(),
});