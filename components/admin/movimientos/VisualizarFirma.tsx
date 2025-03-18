"use client"

import {
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface VisualizarFirmaProps {
    firma: string
    usuario: string
}

export const VisualizarFirma = ({
    firma,
    usuario
}: VisualizarFirmaProps) => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Firma registrada</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
                <img
                    src={firma}
                    alt={`Firma registrada`}
                    className="max-w-full max-h-[400px]"
                />
            </div>
        </>
    )
}