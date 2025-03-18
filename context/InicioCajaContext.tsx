"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { iGetInicioActivo } from "@/interfaces/MovimientosInterface";
import { getInicioActivo } from "@/actions/MovimientosActions";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ContextoInicioCaja {
    inicioCaja: iGetInicioActivo | null;
    verificarInicioCaja: () => Promise<boolean>;
    limpiarInicioCaja: () => void;
}

const InicioCajaContext = createContext<ContextoInicioCaja | null>(null);

export function InicioCajaProvider({ children }: { children: React.ReactNode }) {
    const [inicioCaja, setInicioCaja] = useState<iGetInicioActivo | null>(null);
    const user = useCurrentUser();

    const verificarInicioCaja = async () => {
        if (!user?.usuario.UsuarioID) return false;

        try {
            const respuesta = await getInicioActivo(user.usuario.UsuarioID);

            if (respuesta && !('statusCode' in respuesta)) {
                setInicioCaja(respuesta);

                const fechaExpiracion = new Date();
                fechaExpiracion.setHours(23, 59, 59, 999);

                const datosCookie = {
                    InicioCajaID: respuesta.InicioCajaID,
                    UsuarioID: respuesta.Usuario.UsuarioID
                };

                document.cookie = `inicioCajaActivo=${JSON.stringify(datosCookie)}; expires=${fechaExpiracion.toUTCString()}; path=/; SameSite=Strict`;

                return true;
            }

            limpiarInicioCaja();
            return false;
        } catch (error) {
            limpiarInicioCaja();
            return false;
        }
    };

    const limpiarInicioCaja = () => {
        setInicioCaja(null);
        document.cookie = 'inicioCajaActivo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict';
    };

    useEffect(() => {
        const validarInicioCaja = async () => {
            if (user?.usuario.UsuarioID) {
                const cookieInicioCaja = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('inicioCajaActivo='));

                if (cookieInicioCaja) {
                    const cookieValue = cookieInicioCaja.split('=')[1];
                    try {
                        const datosCookie = JSON.parse(cookieValue);
                        if (datosCookie.UsuarioID === user.usuario.UsuarioID) {
                            await verificarInicioCaja();
                        } else {
                            limpiarInicioCaja();
                        }
                    } catch {
                        limpiarInicioCaja();
                    }
                } else {
                    await verificarInicioCaja();
                }
            }
        };

        validarInicioCaja();

        // Revalidar cada 5 minutos
        const intervalo = setInterval(validarInicioCaja, 5 * 60 * 1000);

        return () => clearInterval(intervalo);
    }, [user?.usuario.UsuarioID]);

    return (
        <InicioCajaContext.Provider value={{
            inicioCaja,
            verificarInicioCaja,
            limpiarInicioCaja
        }}>
            {children}
        </InicioCajaContext.Provider>
    );
}

export function useInicioCaja() {
    const context = useContext(InicioCajaContext);
    if (!context) {
        throw new Error('useInicioCaja debe ser usado dentro de InicioCajaProvider');
    }
    return context;
}