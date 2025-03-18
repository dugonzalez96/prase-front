import { z } from 'zod';

//TODO: Agregar validaciones
export const postVehiculoSchema = z.object({
    ClienteID: z.coerce.number(),
    Marca: z.string().min(1),
    Submarca: z.string(),
    Version: z.string(),
    Modelo: z.coerce.number(),
    AnoFabricacion: z.coerce.number().min(1900).max(new Date().getFullYear()),
    TipoVehiculo: z.string().min(1),
    ValorVehiculo: z.coerce.number().min(0, { message: "Debe ser un número mayor o igual a 0" }),
    ValorFactura: z.coerce.number().min(0, { message: "Debe ser un número mayor o igual a 0" }),
    FechaRegistro: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "FechaRegistro debe ser una fecha válida",
    }),
    UsoVehiculo: z.string().min(1),
    ZonaResidencia: z.string().min(1),
    Salvamento: z.coerce.number().min(0, { message: "Debe ser un número mayor o igual a 0" }),
    NoMotor: z.string(),
    Placas: z.string(),
    VIN: z.string(),
});

export const patchVehiculoSchema = z.object({
    ValorVehiculo: z.coerce.number().min(0, { message: "Debe ser un número mayor o igual a 0" }),
    UsoVehiculo: z.string().min(1),
});
