import { z } from 'zod';

export const postPolizaSchema = z.object({
   CotizacionID: z.number(),
   TipoPagoID: z.number().min(1, {
    message: 'El tipo de pago es requerido.'
   }),
   FechaInicio: z.date(),
   FechaFin: z.date(),
   PrimaTotal: z.coerce.number().min(1, {
    message: 'La Prima Total es requerida.'
   }),
   TotalPagos: z.coerce.number(),
   NumeroPagos: z.number(),
   DescuentoProntoPago: z.coerce.number(),
   TieneReclamos: z.boolean(),
});
