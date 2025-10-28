"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iMovimientoPendiente } from "@/interfaces/ValidacionMovimientosInterface";
import { validarMovimiento, rechazarMovimiento } from "@/actions/ValidacionMovimientosActions";
import { TablaMovimientosPendientes } from "./TablaMovimientosPendientes";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck } from "lucide-react";

interface ValidacionMovimientosClientProps {
    movimientosIniciales: iMovimientoPendiente[];
    usuarioId: number;
}

export function ValidacionMovimientosClient({ 
    movimientosIniciales,
    usuarioId
}: ValidacionMovimientosClientProps) {
    const [movimientos, setMovimientos] = useState(movimientosIniciales);
    const [movimientoAValidar, setMovimientoAValidar] = useState<number | null>(null);
    const [movimientoARechazar, setMovimientoARechazar] = useState<number | null>(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");
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
        setMovimientoAValidar(null);

        if (resultado?.success) {
            toast({
                title: "Movimiento validado",
                description: "El movimiento ha sido validado correctamente",
                variant: "default"
            });

            // Actualizar la lista de movimientos
            setMovimientos(prev => 
                prev.map(m => 
                    m.TransaccionID === movimientoAValidar 
                        ? { ...m, Validado: 1 }
                        : m
                )
            );

            router.refresh();
        } else {
            toast({
                title: "Error",
                description: "No se pudo validar el movimiento",
                variant: "destructive"
            });
        }
    };

    const handleRechazar = (movimientoId: number) => {
        setMovimientoARechazar(movimientoId);
        setMotivoRechazo("");
    };

    const confirmarRechazo = async () => {
        if (!movimientoARechazar || !motivoRechazo.trim()) {
            toast({
                title: "Error",
                description: "Debe proporcionar un motivo para rechazar",
                variant: "destructive"
            });
            return;
        }

        setProcesando(true);
        const resultado = await rechazarMovimiento(
            movimientoARechazar,
            usuarioId,
            motivoRechazo
        );

        setProcesando(false);
        setMovimientoARechazar(null);
        setMotivoRechazo("");

        if (resultado?.success) {
            toast({
                title: "Movimiento rechazado",
                description: "El movimiento ha sido rechazado",
                variant: "default"
            });

            // Actualizar la lista de movimientos
            setMovimientos(prev => 
                prev.map(m => 
                    m.TransaccionID === movimientoARechazar 
                        ? { ...m, Validado: 2 }
                        : m
                )
            );

            router.refresh();
        } else {
            toast({
                title: "Error",
                description: "No se pudo rechazar el movimiento",
                variant: "destructive"
            });
        }
    };

    const movimientosPendientes = movimientos.filter(m => m.Validado === 0);

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8" />
                        Validación de Movimientos
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Revisa y valida los movimientos que requieren aprobación
                    </p>
                </div>
            </div>

            <TablaMovimientosPendientes 
                movimientos={movimientosPendientes}
                onValidar={handleValidar}
                onRechazar={handleRechazar}
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
            <AlertDialog open={movimientoARechazar !== null} onOpenChange={() => {
                setMovimientoARechazar(null);
                setMotivoRechazo("");
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rechazar movimiento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Proporciona un motivo para rechazar el movimiento #{movimientoARechazar}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="motivo">Motivo del rechazo *</Label>
                        <Textarea
                            id="motivo"
                            placeholder="Explica por qué se rechaza este movimiento..."
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            rows={4}
                            className="mt-2"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={procesando}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmarRechazo}
                            disabled={procesando || !motivoRechazo.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {procesando ? "Procesando..." : "Rechazar Movimiento"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
