import { z } from "zod";

const baseSchema = z.array(z.object({
    Clave: z.string().min(1, {
        message: "La clave es requerida.",
    }),
    Nombre: z.string().min(1, {
        message: "El nombre es requerido.",
    }),
}));

export const getAniosSchema = baseSchema;

export const getMarcasPorAnioSchema = baseSchema;

export const getModelosPorAnioMarcaSchema = baseSchema;

export const getVersionesPorAnioMarcaModeloSchema = baseSchema;

export const getPrecioVersionPorClaveSchema = z.object({
    Venta: z.string().min(1, {
        message: "El precio de venta es requerido.",
    }),
    Compra: z.string().min(1, {
        message: "El precio de compra es requerido.",
    }),
    Moneda: z.string().min(1, {
        message: "La moneda es requerida.",
    }),
});
