"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { cancelarCajaGeneral, generarCodigoCancelacionCajaGeneral } from "@/actions/CajaGeneralActions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";

interface CancelarCuadreGeneralModalProps {
    abierto: boolean;
    alCerrar: () => void;
    cuadreId: number;
    onCancelarExitoso: () => void;
}

export function CancelarCuadreGeneralModal({
    abierto,
    alCerrar,
    cuadreId,
    onCancelarExitoso,
}: CancelarCuadreGeneralModalProps) {
    const user = useCurrentUser();
    const { toast } = useToast();
    const esAdmin = user?.grupo?.nombre === "Administrador";

    const [codigoGenerado, setCodigoGenerado] = useState<string>("");
    const [codigoIngresado, setCodigoIngresado] = useState<string>("");
    const [motivo, setMotivo] = useState<string>("");
    const [cargandoCodigo, setCargandoCodigo] = useState(false);
    const [cargandoCancelacion, setCargandoCancelacion] = useState(false);
    const [copiado, setCopiado] = useState(false);

    // Auto-limpiar cuando el modal se abre
    useEffect(() => {
        if (abierto) {
            setCodigoGenerado("");
            setCodigoIngresado("");
            setMotivo("");
        }
    }, [abierto]);

    const generarCodigo = async () => {
        setCargandoCodigo(true);
        try {
            const resultado = await generarCodigoCancelacionCajaGeneral(cuadreId);

            if ("error" in resultado) {
                toast({
                    title: "Error",
                    description: resultado.error,
                    variant: "destructive",
                });
            } else if ("codigo" in resultado) {
                setCodigoGenerado(resultado.codigo);
                setCodigoIngresado(resultado.codigo);
                toast({
                    title: "Éxito",
                    description: "Código generado correctamente",
                    variant: "default",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Respuesta inesperada del servidor",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al generar código",
                variant: "destructive",
            });
        } finally {
            setCargandoCodigo(false);
        }
    };

    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigoGenerado);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const handleCancelar = async () => {
        if (!codigoIngresado.trim()) {
            toast({
                title: "Error",
                description: "Por favor ingresa el código de acceso",
                variant: "destructive",
            });
            return;
        }

        if (!motivo.trim()) {
            toast({
                title: "Error",
                description: "Por favor ingresa un motivo",
                variant: "destructive",
            });
            return;
        }

        setCargandoCancelacion(true);
        try {
            const resultado = await cancelarCajaGeneral(cuadreId, {
                usuario: user?.usuario.NombreUsuario || "",
                codigo: codigoIngresado.toUpperCase(),
                motivo,
            });

            if (!resultado.success) {
                toast({
                    title: "Error",
                    description: resultado.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Éxito",
                    description: "Cuadre general cancelado correctamente",
                    variant: "default",
                });
                limpiarModal();
                onCancelarExitoso();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al cancelar cuadre general",
                variant: "destructive",
            });
        } finally {
            setCargandoCancelacion(false);
        }
    };

    const limpiarModal = () => {
        setCodigoGenerado("");
        setCodigoIngresado("");
        setMotivo("");
        alCerrar();
    };

    return (
        <Dialog open={abierto} onOpenChange={(open) => !open && limpiarModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cancelar Cuadre de Caja General</DialogTitle>
                    <DialogDescription>
                        Este cuadre será marcado como cancelado en el sistema
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* MOSTRAR ID DEL CUADRE */}
                    <Alert className="bg-indigo-50 border-indigo-200">
                        <AlertDescription className="flex gap-2 items-center text-indigo-800 text-sm">
                            <AlertCircle className="h-4 w-4 text-indigo-600" />
                            <strong>Cuadre General #{cuadreId}</strong>
                        </AlertDescription>
                    </Alert>

                    {/* SECCIÓN DE GENERACIÓN DE CÓDIGO (SOLO ADMIN) */}
                    {esAdmin && (
                        <div className="border rounded-lg p-4 bg-blue-50">
                            {!codigoGenerado ? (
                                <Button
                                    onClick={generarCodigo}
                                    disabled={cargandoCodigo}
                                    className="w-full"
                                >
                                    {cargandoCodigo ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        "Generar Código"
                                    )}
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded">
                                        <code className="flex-1 font-mono font-bold text-lg text-center tracking-widest">
                                            {codigoGenerado}
                                        </code>
                                        <Button
                                            onClick={copiarCodigo}
                                            size="sm"
                                            variant="ghost"
                                            title="Copiar código"
                                        >
                                            {copiado ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-600 text-center">
                                        ✓ Código generado. Cópialo y comparte con el usuario.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setCodigoGenerado("");
                                            setCodigoIngresado("");
                                        }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Generar otro código
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECCIÓN DE CANCELACIÓN */}
                    {!esAdmin && (
                        <Alert className="bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 text-sm">
                                El administrador debe proporcionar el código de acceso para proceder con la cancelación.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Código de Acceso</label>
                            <Input
                                placeholder="Ingresa el código proporcionado"
                                value={codigoIngresado}
                                onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                                disabled={cargandoCancelacion}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Motivo de Cancelación</label>
                            <Textarea
                                placeholder="Explica por qué se cancela este cuadre"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                disabled={cargandoCancelacion}
                                className="mt-1 resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={limpiarModal}
                        disabled={cargandoCancelacion}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCancelar}
                        disabled={cargandoCancelacion}
                        variant="destructive"
                    >
                        {cargandoCancelacion ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cancelando...
                            </>
                        ) : (
                            "Aceptar Cancelación"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
