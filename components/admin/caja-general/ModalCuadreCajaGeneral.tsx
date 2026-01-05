"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormularioCuadreCajaGeneral } from "./FormularioCuadreCajaGeneral";
import { iGetSucursales } from "@/interfaces/SucursalesInterface";

interface ModalCuadreCajaGeneralProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    usuarioId: number;
    sucursalUsuarioId: number;
    sucursales: iGetSucursales[];
    fechaActual: string;
    saldoEsperado: number;
    totalTarjetaCapturado: number;
    totalTransferenciaCapturado: number;
}

export function ModalCuadreCajaGeneral({
    isOpen,
    onOpenChange,
    onSuccess,
    usuarioId,
    sucursalUsuarioId,
    sucursales,
    fechaActual,
    saldoEsperado,
    totalTarjetaCapturado,
    totalTransferenciaCapturado,
}: ModalCuadreCajaGeneralProps) {
    const handleSuccess = () => {
        onOpenChange(false);
        onSuccess?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cuadre de Caja General</DialogTitle>
                </DialogHeader>
                <FormularioCuadreCajaGeneral
                    usuarioId={usuarioId}
                    sucursalUsuarioId={sucursalUsuarioId}
                    sucursales={sucursales}
                    onSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                    fechaActual={fechaActual}
                    saldoEsperado={saldoEsperado}
                    totalTarjetaCapturado={totalTarjetaCapturado}
                    totalTransferenciaCapturado={totalTransferenciaCapturado}
                />
            </DialogContent>
        </Dialog>
    );
}
