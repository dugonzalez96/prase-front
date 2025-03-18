"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import GenerarCodigoModal from "./GenerarCodigoModal";

export const ClienteGenerarCodigo = () => {
    const [modalAbierto, setModalAbierto] = useState(false);

    return (
        <>
            <Button onClick={() => setModalAbierto(true)} variant="success">
                <KeyRound className="h-4 w-4 mr-2" />
                Generar código
            </Button>

            <GenerarCodigoModal
                abierto={modalAbierto}
                alCerrar={() => setModalAbierto(false)}
            />
        </>
    );
}