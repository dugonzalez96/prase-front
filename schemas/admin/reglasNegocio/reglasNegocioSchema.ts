import { z } from "zod"

export const editReglaNegocioSchema = z.object({
    NombreRegla: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    EsGlobal: z.boolean(),
    Activa: z.boolean(),
    cobertura: z.object({
        CoberturaID: z.coerce.number(),
    }),
    TipoRegla: z.string().min(1, { message: "El tipo de regla es requerido" }),
    TipoMonedaID: z.coerce.number().min(1, {
        message: "El tipo de moneda es requerido"
    }),
    condiciones: z.array(z.object({
        Campo: z.string().min(1, {
            message: "El campo es requerido"
        }),
        Operador: z.string().min(1, {
            message: "El operador es requerido"
        }),
        Valor: z.string().min(1, {
            message: "El valor es requerido"
        }),
        Evaluacion: z.string().min(1, {
            message: "El evaluador es requerido"
        }),
    })),
}).refine((data) => {
    // Si EsGlobal es true, entonces cobertura debe estar presente y no vacía
    return data.EsGlobal || (data.cobertura && data.cobertura.CoberturaID);
}, {
    message: "La cobertura es requerida cuando la regla no es global.",
    path: ["cobertura"], // Esto muestra el error en el campo cobertura
});

export const nuevaReglaNegocioSchema = z.object({
    NombreRegla: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    Descripcion: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
    TipoAplicacion: z.string().min(1, {
        message: "El tipo de aplicación es requerido"
    }),
    TipoRegla: z.string().min(1, {
        message: "El tipo de regla es requerido"
    }),
    TipoMonedaID: z.coerce.number(),
    EsGlobal: z.boolean(),
    Activa: z.boolean(),
    cobertura: z.object({
        CoberturaID: z.coerce.number(),
    }),
    condiciones: z.array(z.object({
        Campo: z.string().min(1, {
            message: "El campo es requerido"
        }),
        Operador: z.string().min(1, {
            message: "El operador es requerido"
        }),
        Valor: z.string().min(1, {
            message: "El valor es requerido"
        }),
        Evaluacion: z.string().min(1, {
            message: "Es requerido"
        }),
        tipoMoneda: z.coerce.number(),
    })),
}).refine((data) => {
    // Si EsGlobal es true, entonces cobertura debe estar presente y no vacía
    return data.EsGlobal || (data.cobertura && data.cobertura.CoberturaID);
}, {
    message: "La cobertura es requerida cuando la regla no es global.",
    path: ["cobertura"], // Esto muestra el error en el campo cobertura
});