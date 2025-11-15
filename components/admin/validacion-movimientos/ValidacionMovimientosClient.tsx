"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iMovimientoPendiente } from "@/interfaces/ValidacionMovimientosInterface";
import { getMovimientosPendientes, validarMovimiento } from "@/actions/ValidacionMovimientosActions";
import { TablaMovimientosPendientes } from "./TablaMovimientosPendientes";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ValidacionMovimientosClientProps {
    movimientosIniciales: iMovimientoPendiente[];
    usuarioId: number;
    onDataActualizada?: () => void;
}

export function ValidacionMovimientosClient({
    movimientosIniciales,
    usuarioId,
    onDataActualizada
}: ValidacionMovimientosClientProps) {
    const [movimientos, setMovimientos] = useState(movimientosIniciales);
    const [movimientoAValidar, setMovimientoAValidar] = useState<number | null>(null);
    const [procesando, setProcesando] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleValidar = (movimientoId: number) => {
        setMovimientoAValidar(movimientoId);
    };

    const confirmarValidacion = async () => {
        if (!movimientoAValidar) return;

        setProcesando(true);
        const resultado = await validarMovimiento({
            TransaccionID: movimientoAValidar,
            UsuarioValidoID: usuarioId,
            Aprobado: true
        });

        setProcesando(false);

        if (resultado?.success) {
            toast({
                title: "Movimiento validado",
                description: "El movimiento ha sido validado correctamente",
                variant: "default"
            });

            const nuevosMovimientos = await getMovimientosPendientes();
            setMovimientos(nuevosMovimientos);
            setMovimientoAValidar(null);

            // Notificar al padre que se actualizaron los datos
            if (onDataActualizada) {
                onDataActualizada();
            }

            router.refresh();
        } else {
            toast({
                title: "Error",
                description: "No se pudo validar el movimiento",
                variant: "destructive"
            });
        }
    };

    const movimientosPendientes = movimientos.filter(m => m.Validado === 0);

    return (
        <>
            <TablaMovimientosPendientes
                movimientos={movimientosPendientes}
                onValidar={handleValidar}
            />

            {/* Dialog de confirmación para validar */}
            <AlertDialog open={movimientoAValidar !== null} onOpenChange={() => setMovimientoAValidar(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Validar este movimiento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción aprobará el movimiento #{movimientoAValidar} y lo incluirá en los cortes de caja.
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
                            {procesando ? "Procesando..." : "Validar Movimiento"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog para rechazar con motivo */}
            <AlertDialog open={false}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rechazar movimiento</AlertDialogTitle>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
