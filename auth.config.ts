import type { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas/loginSchema";


const url = process.env.API_URL;

export default {
    providers: [
        credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);

                if (!validatedFields.success) {
                    console.error("Error de validación:", validatedFields.error);
                    return null;
                }

                const { username, password } = validatedFields.data;

                const formToSend = {
                    username,
                    password
                }

                const res = await fetch(`${url}/auth/login`, {
                    method: "POST",
                    body: JSON.stringify(formToSend),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.status !== 201) {
                    console.error("Error de autenticación:", await res.text());
                    return null;
                }

                const user = await res.json();

                if (!user || !user.access_token) {
                    return null;
                }

                return {
                    ...user,
                    jwt: user.access_token,
                };
            }
        })
    ],
} satisfies NextAuthConfig