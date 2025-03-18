import * as z from "zod";

const phoneNumberRegex = /^\d{10}$/;

// Schemas auxiliares
const detalleSchema = z.object({
    CoberturaID: z.number().min(1, "CoberturaID es requerido"),
    MontoSumaAsegurada: z.coerce.number().min(1, "Monto de suma asegurada es requerido"),
    DeducibleID: z.number().min(1, "DeducibleID es requerido"),
    MontoDeducible: z.number().min(1, "Monto deducible es requerido"),
    PrimaCalculada: z.number().min(1, "Prima calculada es requerida"),
    PorcentajePrimaAplicado: z.number().min(0, "Porcentaje prima aplicado es requerido"),
    ValorAseguradoUsado: z.coerce.number().min(1, "Valor asegurado usado es requerido"),
    NombreCobertura: z.string(),
    Descripcion: z.string(),
    DisplaySumaAsegurada: z.any(),
    SumaAseguradaPorPasajero: z.any(),
});

export const nuevaCotizacionSchema = z.object({
    // Datos básicos
    UsuarioID: z.number().min(1, "UsuarioID es requerido"),
    EstadoCotizacion: z.string().default("REGISTRO"),

    // Datos financieros
    PrimaTotal: z.number().min(0, "La Prima Total no puede ser negativa"),
    TipoPagoID: z.number().min(0, "El tipo de pago es requerido"),
    PorcentajeDescuento: z.number(),
    DerechoPoliza: z.coerce.number(),

    // Datos de suma asegurada
    TipoSumaAseguradaID: z.coerce.number().min(1, "Tipo de suma asegurada es requerido"),
    SumaAsegurada: z.coerce.number()
        .min(1, "La suma asegurada es requerida")
        .refine((val) => val > 0, "La suma asegurada debe ser mayor a 0"),

    // Datos de la póliza
    PeriodoGracia: z.coerce.number(),
    PaqueteCoberturaID: z.number().min(1, "El paquete de cobertura es requerido"),

    // Datos del vehículo
    UsoVehiculo: z.number().min(1, "El uso del vehículo es requerido"),
    TipoVehiculo: z.number().min(1, "El tipo de vehículo es requerido"),
    Placa: z.string(),
    NoMotor: z.string(),

    // Datos opcionales
    NombrePersona: z.string(),
    Correo: z.string().email({ message: "El correo electrónico es requerido" }),
    Telefono: z.string().regex(phoneNumberRegex, { message: "El número debe contener 10 dígitos" }),
    UnidadSalvamento: z.boolean(),
    VIN: z.string(),

    // Datos de ubicación
    CP: z.string().min(3, "El código postal es requerido"),

    // Datos del vehículo extendidos
    Modelo: z.string().min(1, "El año es requerido"),
    Marca: z.string().min(1, "La marca es requerida"),
    Submarca: z.string().min(1, "El modelo es requerido"),
    Version: z.string().min(1, "La versión es requerida"),

    // Datos de vigencia
    meses: z.coerce.number(),
    vigencia: z.string(),

    // Rangos de suma asegurada
    minSumaAsegurada: z.coerce.number().default(0),
    maxSumaAsegurada: z.coerce.number().default(0),

    // Fechas
    inicioVigencia: z.date(),
    finVigencia: z.string(),

    // Detalles de coberturas
    detalles: z.array(detalleSchema).min(1, "Debe seleccionar al menos una cobertura"),

    // Campos auxiliares
    CostoBase: z.number().default(0),
    AjusteSiniestralidad: z.number().default(0),
    AjusteCP: z.number().default(0),
    AjusteTipoPago: z.number().default(0),
    SubtotalSiniestralidad: z.number().default(0),
    SubtotalTipoPago: z.number().default(0),
    CostoNeto: z.number().default(0),
    IVA: z.number().default(0),
    versionNombre: z.string(),
    marcaNombre: z.string(),
    modeloNombre: z.string(),
    Estado: z.string(),
    tipoCalculo: z.enum(["fijo", "cobertura"]),
    costoTotalAnual: z.number(),
    costoTotalSemestral: z.number(),
    costoTotalTrimestral: z.number(),
    costoTotalMensual: z.number(),
    showMensual: z.boolean(),
}).refine(
    (data) => {
        const inicio = new Date(data.inicioVigencia);
        const fin = new Date(data.finVigencia);
        return fin > inicio;
    },
    {
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
        path: ["finVigencia"],
    }
);

// Tipo inferido del schema
export type CotizacionFormData = z.infer<typeof nuevaCotizacionSchema>;

export const editarCotizacionSchema = z.object({
    NombrePersona: z.string().min(1, {
        message: "El nombre es requerido"
    }),
    EstadoCotizacion: z.string(),
    TipoPagoID: z.coerce.number(),
    PorcentajeDescuento: z.coerce.number(),
    DerechoPoliza: z.coerce.number(),
    Marca: z.string().min(1, {
        message: "Obligatorio"
    }),
    Submarca: z.string().min(1, {
        message: "Obligatorio"
    }),
    Modelo: z.string().min(1, {
        message: "Obligatorio"
    }),
    Version: z.string().min(1, {
        message: "Obligatorio"
    }),
    detalles: z.array(
        z.object({
            DetalleID: z.number(),
            PolizaID: z.any(),
            CoberturaID: z.number(),
            MontoSumaAsegurada: z.coerce.number(),
            MontoDeducible: z.coerce.number(),
            PrimaCalculada: z.coerce.number(),
            EsPoliza: z.null(),
            PorcentajePrimaAplicado: z.coerce.number(),
            ValorAseguradoUsado: z.coerce.number()
        })
    )
});