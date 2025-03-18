import { z, ZodSchema } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(3, {
        message: "El nombre de usuario es requerido"
    }),
    password: z.string().min(3, {
        message: "La contraseña es requerida"
    }),
});