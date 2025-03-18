import { z } from "zod";

export const nuevaConfiguracionGlobalSchema = z.object({
    NombreConfiguracion: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    ValorConfiguracion: z.coerce.number().min(1, {
        message: "El valor de la configuración es requerido"
    }),
    Descripcion: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
});

export const editConfiguracionGlobalSchema = z.object({
    ValorConfiguracion: z.coerce.number().min(1, {
        message: "El valor de la configuración es requerido"
    }),
    Descripcion: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
});