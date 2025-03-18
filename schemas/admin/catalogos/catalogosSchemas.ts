import { z } from "zod"

export const nuevoPaqueteSchema = z.object({
    NombrePaquete: z.string().min(3, {
        message: "El nombre debe contener al menos 3 caracteres.",
    }),
    DescripcionPaquete: z.string().min(3, {
        message: "La descripción debe contener al menos 3 caracteres."
    }),
    PrecioTotalFijo: z.coerce.number(),
});

export const editPaqueteSchema = z.object({
    NombrePaquete: z.string(),
    DescripcionPaquete: z.string(),
    PrecioTotalFijo: z.coerce.number(),
});

export const nuevoDeducibleSchema = z.object({
    DeducibleMinimo: z.coerce.number().min(1, {
        message: "El deducible mínimo es requerido"
    }),
    DeducibleMaximo: z.coerce.number().min(1, {
        message: "El deducible máximo es requerido"
    }),
    Rango: z.coerce.number().min(1, {
        message: "El rango es requerido"
    }),
});

export const editDeducibleSchema = z.object({
    DeducibleMinimo: z.coerce.number(),
    DeducibleMaximo: z.coerce.number(),
    Rango: z.coerce.number(),
});

export const editTipoSumaSchema = z.object({
    NombreTipo: z.string().min(1, "El nombre es requerido"),
    DescripcionSuma: z.string().min(1, "La descripción es requerida"),
});

export const nuevoTipoSumaSchema = z.object({
    NombreTipo: z.string().min(1, "El nombre es requerido"),
    DescripcionSuma: z.string().min(1, "La descripción es requerida"),
});

export const nuevaCoberturaSchema = z.object({
    NombreCobertura: z.string().min(1, {
        message: 'Nombre de la cobertura es requerido',
    }),
    Descripcion: z.string(),
    PrimaBase: z.coerce.number().min(0, {
        message: 'Prima base es requerida y debe ser un número válido',
    }),
    SumaAseguradaMin: z.coerce.number(),
    SumaAseguradaMax: z.coerce.number(),
    DeducibleMin: z.coerce.number(),
    DeducibleMax: z.coerce.number(),
    PorcentajePrima: z.coerce.number(),
    RangoSeleccion: z.coerce.number(),
    EsCoberturaEspecial: z.boolean(),
    SinValor: z.boolean(),
    IndiceSiniestralidad: z.boolean(),
    AplicaSumaAsegurada: z.boolean(),
    primaMinima: z.coerce.number(),
    primaMaxima: z.coerce.number(),
    factorDecrecimiento: z.coerce.number(),
    tipoMoneda: z.coerce.number().min(1, {
        message: 'El tipo de moneda es requerido'
    }),
    tipoDeducible: z.coerce.number().min(1, {
        message: 'El tipo de deducible es requerido'
    }),
    CoberturaAmparada: z.boolean(),
    sumaAseguradaPorPasajero: z.boolean(),
    rangoCobertura: z.coerce.number(),
});


export const editCoberturaSchema = z.object({
    NombreCobertura: z.string(),
    Descripcion: z.string(),
    PrimaBase: z.string(),
    SumaAseguradaMin: z.string(),
    SumaAseguradaMax: z.string(),
    DeducibleMin: z.string(),
    DeducibleMax: z.string(),
    PorcentajePrima: z.string(),
    RangoSeleccion: z.string(),
    primaMinima: z.string(),
    primaMaxima: z.string(),
    factorDecrecimiento: z.string(),
    rangoCobertura: z.string().nullable(),
    EsCoberturaEspecial: z.boolean(),
    Variable: z.boolean(),
    SinValor: z.boolean(),
    AplicaSumaAsegurada: z.boolean(),
    CoberturaAmparada: z.boolean(),
    sumaAseguradaPorPasajero: z.boolean(),
    tipoMoneda: z.number(),
    tipoDeducible: z.number()
});

export const nuevaAsociacionSchema = z.object({
    paqueteId: z.coerce.number().min(1, { message: "Paquete es requerido" }),
    coberturas: z
        .array(
            z.object({
                CoberturaID: z.number(),
                obligatoria: z.boolean(),
            })
        )
        .min(1, { message: "Debe seleccionar al menos una cobertura" }),
});

export const nuevoGrupoSchema = z.object({
    nombre: z.string().min(1, { message: "El nombre del grupo es requerido." }),
    descripcion: z.string().min(1, { message: "La descripción del grupo es requerida." }),
});

export const groupEditSchema = z.object({
    nombre: z.string(),
    descripcion: z.string(),
});

export const nuevaApplicationSchema = z.object({
    nombre: z.string().min(1, { message: "El nombre de la aplicación es requerido" }),
    descripcion: z.string().min(1, { message: "La descripción de la aplicación es requerida" }),
    icon: z.string().min(1, { message: "El icono de la aplicación es requerido" }),
    color: z.string().min(1, { message: "El color de la aplicación es requerido" }),
    categoria: z.enum(['Administración', 'Catalogos', 'Cotizaciones', 'Siniestros', 'Reportería', 'Control de Cajas', 'Recursos Humanos'], { message: "La categoría de la aplicación es requerida" }),
});

export const editApplicationSchema = z.object({
    nombre: z.string(),
    descripcion: z.string(),
    icon: z.string(),
    color: z.string(),
    categoria: z.enum(['Administración', 'Catalogos', 'Cotizaciones', 'Siniestros', 'Reportería', 'Control de Cajas', 'Recursos Humanos']),
});

export const editMonedaSchema = z.object({
    Nombre: z.string().optional(),
    Abreviacion: z.string().optional(),
});

export const nuevaMonedaSchema = z.object({
    Nombre: z.string().min(1, "El nombre es requerido"),
    Abreviacion: z.string().min(1, "La abreviación es requerida"),
});

export const nuevoUsoVehiculoSchema = z.object({
    Nombre: z.string().min(1, "El nombre es requerido"),
});

export const nuevoTipoDeducibleSchema = z.object({
    Nombre: z.string().min(1, "El nombre es requerido"),
});

export const nuevoTipoPagoSchema = z.object({
    Descripcion: z.string().min(1, "La descripción es requerida"),
    PorcentajeAjuste: z.coerce.number().min(0, "Porcentaje ajuste es requerido"),
    Divisor: z.coerce.number().min(0, "Divisor es requerido")
});

export const editarTipoPagoSchema = z.object({
    Descripcion: z.string().min(1, "La descripción es requerida"),
    PorcentajeAjuste: z.coerce.number().min(0, "Porcentaje ajuste es requerido"),
    Divisor: z.string().min(0, "Divisor es requerido"),
});

export const nuevoAjusteCPSchema = z.object({
    CodigoPostal: z.string().length(5, "El código postal debe tener 5 dígitos"),
    IndiceSiniestros: z.coerce.number().min(0).max(100),
    AjustePrima: z.coerce.number().min(0).max(100),
    CantSiniestros: z.coerce.number().min(0),
});

export const editarAjusteCPSchema = z.object({
    IndiceSiniestros: z.coerce.number().min(0).max(100),
    AjustePrima: z.coerce.number().min(0).max(100),
    CantSiniestros: z.coerce.number().min(0),
});