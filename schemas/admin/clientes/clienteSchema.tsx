import { z } from "zod";

// Esquema para iPostCliente
const postClienteSchema = z.object({
    NombreCompleto: z.string().min(1, "El nombre no puede estar vacío"),
    FechaNacimiento: z.string(),
    Genero: z.string().min(1, "El genero no puede estar vacío"),
    Direccion: z.string().min(1, "La dirección no puede estar vacía"),
    Telefono: z.string().min(10, "El teléfono debe tener al menos 10 caracteres"), // Puedes ajustar el tamaño
    Email: z.string().email("Debe ser un email válido"),
    HistorialSiniestros: z.coerce.number().min(0, "Debe ser un número mayor o igual a 0"),
    HistorialReclamos: z.coerce.number().min(0, "Debe ser un número mayor o igual a 0"),
    ZonaResidencia: z.string().min(1, "La zona no puede estar vacía"),
    FechaRegistro: z.string(),
    RFC: z.string(),
});

// Esquema para iPatchContacto
const patchClientechema = z.object({
    Direccion: z.string().min(1, "La dirección no puede estar vacía"),
    Telefono: z.string().min(10, "El teléfono debe tener al menos 10 caracteres"), // Ajusta según sea necesario
});

export { postClienteSchema, patchClientechema };
