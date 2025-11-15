"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iPagoPendiente } from "@/interfaces/PagosPolizaInterface";
import { validarPago } from "@/actions/PagosPolizaActions";
import { TablaPagosPendientes } from "./TablaPagosPendientes";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getPagosPendientes } from "@/actions/PagosPolizaActions";

interface ValidacionPagosClientProps {
    pagosIniciales: iPagoPendiente[];
    usuarioId: number;
    onDataActualizada?: () => void;
}

export function ValidacionPagosClient({ 
    pagosIniciales,
    usuarioId,
    onDataActualizada
}: ValidacionPagosClientProps) {
    const [pagos, setPagos] = useState(pagosIniciales);
    const [pagoAValidar, setPagoAValidar] = useState<number | null>(null);
    const [procesando, setProcesando] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleValidar = (pagoId: number) => {
        setPagoAValidar(pagoId);
    };

    const confirmarValidacion = async () => {
        if (!pagoAValidar) return;

        setProcesando(true);
        const resultado = await validarPago(pagoAValidar, {
            UsuarioValidoID: usuarioId,
            Validado: true
        });

        setProcesando(false);
        setPagoAValidar(null);

        if (resultado?.success) {
            toast({
                title: "Pago validado",
                description: "El pago ha sido validado correctamente",
                variant: "default"
            });

            // Actualizar la lista de pagos
            const nuevosPagos = await getPagosPendientes();
            setPagos(nuevosPagos || pagos);

            // Notificar al padre que se actualizaron los datos
            if (onDataActualizada) {
                onDataActualizada();
            }

            router.refresh();
        } else {
            toast({
                title: "Error",
                description: "No se pudo validar el pago",
                variant: "destructive"
            });
        }
    };

    const pagosPendientes = pagos.filter(p => p.Validado === 0);

    return (
        <>
            <TablaPagosPendientes 
                pagos={pagosPendientes}
                onValidar={handleValidar}
            />

            {/* Dialog de confirmación para validar */}
            <AlertDialog open={pagoAValidar !== null} onOpenChange={() => setPagoAValidar(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Validar este pago?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción aprobará el pago #{pagoAValidar} y se registrará como validado.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={procesando}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmarValidacion}
                            disabled={procesando}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {procesando ? "Procesando..." : "Validar Pago"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
