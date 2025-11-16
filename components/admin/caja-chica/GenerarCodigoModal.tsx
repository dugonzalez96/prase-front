"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { generarCodigoCancelacion } from "@/actions/CajaChicaActions";
import { useToast } from "@/hooks/use-toast";

interface GenerarCodigoModalProps {
    abierto: boolean;
    alCerrar: () => void;
}

export function GenerarCodigoModal({
    abierto,
    alCerrar,
}: GenerarCodigoModalProps) {
    const { toast } = useToast();
    const [idCuadre, setIdCuadre] = useState<string>("");
    const [codigoGenerado, setCodigoGenerado] = useState<string>("");
    const [cargando, setCargando] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const generarCodigo = async () => {
        if (!idCuadre.trim()) {
            toast({
                title: "Error",
                description: "Por favor ingresa el ID del cuadre",
                variant: "destructive",
            });
            return;
        }

        const id = Number(idCuadre);
        if (isNaN(id) || id <= 0) {
            toast({
                title: "Error",
                description: "El ID debe ser un número válido",
                variant: "destructive",
            });
            return;
        }

        setCargando(true);
        try {
            const resultado = await generarCodigoCancelacion(id);
            console.log("🚀 ~ generarCodigo ~ resultado:", resultado)

            if ("error" in resultado) {
                toast({
                    title: "Error",
                    description: resultado.error,
                    variant: "destructive",
                });
                setCargando(false);
            } else if ("codigo" in resultado) {
                setCodigoGenerado(resultado.codigo);
                toast({
                    title: "Éxito",
                    description: "Código generado correctamente",
                    variant: "default",
                });
                setCargando(false);
            } else {
                toast({
                    title: "Error",
                    description: "Respuesta inesperada del servidor",
                    variant: "destructive",
                });
                setCargando(false);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al generar código",
                variant: "destructive",
            });
            setCargando(false);
        }
    };

    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigoGenerado);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const limpiarModal = () => {
        setIdCuadre("");
        setCodigoGenerado("");
        alCerrar();
    };

    return (
        <Dialog open={abierto} onOpenChange={(open) => !open && limpiarModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generar Código de Cancelación</DialogTitle>
                    <DialogDescription>
                        Ingresa el ID del cuadre para generar su código de cancelación
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                            Comparte el código generado con el usuario que requiere cancelar el cuadre.
                        </AlertDescription>
                    </Alert>

                    {!codigoGenerado ? (
                        <>
                            <div>
                                <label className="text-sm font-medium">ID del Cuadre</label>
                                <Input
                                    type="number"
                                    placeholder="Ingresa el ID del cuadre"
                                    value={idCuadre}
                                    onChange={(e) => setIdCuadre(e.target.value)}
                                    disabled={cargando}
                                    className="mt-1"
                                    min={1}
                                />
                            </div>
                            <Button
                                onClick={generarCodigo}
                                disabled={cargando || !idCuadre.trim()}
                                className="w-full"
                            >
                                {cargando ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    "Generar Código"
                                )}
                            </Button>
                        </>
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
                                    setIdCuadre("");
                                    setCodigoGenerado("");
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Generar otro código
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={limpiarModal}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
