"use server";

import { AuthError } from "next-auth";
import * as z from "zod";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas/loginSchema";
import { cookies } from "next/headers";

export const login = async (
    values: z.infer<typeof LoginSchema>,
) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Todos los campos son requeridos." };
    }

    const { username, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            username,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        });

        // Clear any existing session cookies before setting new ones
        const cookieStore = cookies();
        cookieStore.getAll().forEach((cookie) => {
            if (cookie.name.startsWith('next-auth')) {
                cookieStore.delete(cookie.name);
            }
        });
        return { success: true };

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Nombre de usuario o contraseña incorrecta" }
                default:
                    return { error: "¡Oops! Algo ha salido mal", message: error }
            }
        }

        throw error;
    }
}