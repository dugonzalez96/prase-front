"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import GenerarCodigoModalCorteUsuario from "./GenerarCodigoModalCorteUsuario";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const ClienteGenerarCodigoCorteUsuario = () => {
    const [modalAbierto, setModalAbierto] = useState(false);
    const user = useCurrentUser();

    // Solo mostrar el botón si el usuario es administrador
    if (user?.grupo?.nombre !== "Administrador") {
        return null;
    }

    return (
        <>
            <Button onClick={() => setModalAbierto(true)} variant="success">
                <KeyRound className="h-4 w-4 mr-2" />
                Generar código
            </Button>

            <GenerarCodigoModalCorteUsuario
                abierto={modalAbierto}
                alCerrar={() => setModalAbierto(false)}
            />
        </>
    );
}