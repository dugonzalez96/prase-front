"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { iGetInicioActivo } from "@/interfaces/MovimientosInterface";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { patchInicioCaja } from "@/actions/MovimientosActions";

type ReactSignatureCanvas = SignatureCanvas;

interface PropiedadesModal {
    inicioCaja: iGetInicioActivo;
    abierto: boolean;
    alCerrar: () => void;
    alAceptar: () => void;
}

export const InicioCajaActivoModal = ({
    inicioCaja,
    abierto,
    alCerrar,
    alAceptar
}: PropiedadesModal) => {
    const signatureRef = useRef<ReactSignatureCanvas>(null);
    const { toast } = useToast();

    const limpiarFirma = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
        }
    };

    const manejarAceptar = async () => {
        if (!signatureRef.current || signatureRef.current.isEmpty()) {
            toast({
                title: "Error",
                description: "Debe firmar para aceptar el inicio de caja",
                variant: "destructive",
            });
            return;
        }

        try {
            const firmaBase64 = signatureRef.current.toDataURL();
            const respuesta = await patchInicioCaja(inicioCaja.InicioCajaID, {
                FirmaElectronica: firmaBase64,
            });

            if (respuesta?.error) {
                toast({
                    title: "Error",
                    description: "Error al actualizar el inicio de caja",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Éxito",
                description: "Inicio de caja aceptado correctamente",
            });
            alAceptar();
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al procesar la firma",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={abierto} onOpenChange={alCerrar}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Inicio de Caja Activo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                        <p className="font-medium">{formatDateTimeFull(inicioCaja.FechaInicio)}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Monto inicial</p>
                        <p className="font-medium">{formatCurrency(Number(inicioCaja.MontoInicial))}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Total efectivo</p>
                        <p className="font-medium">{formatCurrency(Number(inicioCaja.TotalEfectivo))}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Total transferencia</p>
                        <p className="font-medium">{formatCurrency(Number(inicioCaja.TotalTransferencia))}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Usuario que autorizó</p>
                        <p className="font-medium">{inicioCaja.UsuarioAutorizo.NombreUsuario}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Firma de aceptación</p>
                        {inicioCaja.FirmaElectronica ? (
                            <div className="border rounded-lg p-4">
                                <img
                                    src={inicioCaja.FirmaElectronica}
                                    alt="Firma electrónica"
                                    className="max-h-40 mx-auto"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="border rounded-lg">
                                    <SignatureCanvas
                                        ref={signatureRef}
                                        canvasProps={{
                                            className: "w-full h-40",
                                            style: { width: "100%", height: "160px" }
                                        }}
                                        backgroundColor="rgb(255, 255, 255)"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={limpiarFirma}
                                    size="sm"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Limpiar firma
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={alCerrar}
                        >
                            Cerrar
                        </Button>
                        {!inicioCaja.FirmaElectronica && (
                            <Button
                                onClick={manejarAceptar}
                            >
                                Aceptar y firmar
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};