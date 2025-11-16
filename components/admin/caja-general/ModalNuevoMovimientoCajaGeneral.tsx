"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { NuevoMovimientoCajaGeneralForm } from "./NuevoMovimientoCajaGeneralForm";
import { iGetCuentasBancarias } from "@/interfaces/ClientesInterface";
import { iGetUsers } from "@/interfaces/SeguridadInterface";

interface ModalNuevoMovimientoCajaGeneralProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    usuarioId: number;
    cuentasBancarias: iGetCuentasBancarias[];
    usuarios: iGetUsers[];
    fechaActual: string;
}

export function ModalNuevoMovimientoCajaGeneral({
    isOpen,
    onClose,
    onSuccess,
    usuarioId,
    cuentasBancarias,
    usuarios,
    fechaActual,
}: ModalNuevoMovimientoCajaGeneralProps) {
    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Movimiento</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo movimiento en caja general
                    </DialogDescription>
                </DialogHeader>
                <NuevoMovimientoCajaGeneralForm
                    usuarioId={usuarioId}
                    cuentasBancarias={cuentasBancarias}
                    usuarios={usuarios}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                    fechaActual={fechaActual}
                />
            </DialogContent>
        </Dialog>
    );
}
