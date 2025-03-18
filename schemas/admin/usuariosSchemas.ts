import { z } from "zod";

export const registrarUsuarioSchema = z.object({
    username: z.string().email({
        message: "Introduzca un email válido"
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres",
    }),
    idGroup: z.coerce.number().min(1, {
        message: "El grupo es requerido"
    }),
    EmpleadoID: z.coerce.number().min(1, {
        message: "El empleado es requerido"
    }),
    confirmPassword: z.string(),
    SucursalID: z.coerce.number().min(1, {
        message: "La sucursal es requerida"
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export const editarUsuarioSchema = z.object({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    idGroup: z.number().min(1, "Debe seleccionar un grupo"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});