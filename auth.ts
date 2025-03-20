import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    pages: {
        signIn: "/login",
        error: "/error",
    },

    callbacks: {
        async signIn({ user }) {
            return user ? true : false;
        },

        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    jwt: token.access_token as string,
                    aplicaciones: token.aplicaciones || [],
                    usuario: token.usuario,
                    empleado: token.empleado,
                    grupo: token.grupo,

                };
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.access_token = user.jwt;
                token.aplicaciones = user.aplicaciones;
                token.usuario = user.usuario;
                token.empleado = user.empleado;
                token.grupo = user.grupo
            }

            return token;
        },
    },

    session: { strategy: "jwt" },
    ...authConfig,
});
