"use client";

import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cancelarCorteConCodigo } from "@/actions/CorteDelDiaActions";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

interface CancelarCorteModalProps {
    abierto: boolean;
    alCerrar: () => void;
    corteID: number;
}

export default function CancelarCorteModal({ abierto, alCerrar, corteID }: CancelarCorteModalProps) {
    const [codigo, setCodigo] = useState("");
    const [motivo, setMotivo] = useState("");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const user = useCurrentUser();
    const router = useRouter();

    const handleCancelar = async () => {
        if (!codigo) {
            toast({
                title: "Error",
                description: "Debes ingresar el código de autorización",
                variant: "destructive",
            });
            return;
        }

        if (!motivo) {
            toast({
                title: "Error",
                description: "Debes ingresar el motivo de cancelación",
                variant: "destructive",
            });
            return;
        }

        if (!user?.usuario?.NombreUsuario) {
            toast({
                title: "Error",
                description: "No se pudo obtener el usuario actual",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            try {
                const respuesta = await cancelarCorteConCodigo(
                    corteID,
                    user.usuario.NombreUsuario,
                    codigo,
                    motivo
                );

                if (!respuesta?.success) {
                    toast({
                        title: "Error",
                        description: respuesta?.error || "Error al cancelar el corte",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Éxito",
                    description: "Corte cancelado correctamente",
                });

                handleCerrar();
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Error al cancelar el corte",
                    variant: "destructive",
                });
            }
        });
    };

    const handleCerrar = () => {
        setCodigo("");
        setMotivo("");
        alCerrar();
    };

    return (
        <Dialog open={abierto} onOpenChange={handleCerrar}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Cancelar Corte del Día
                    </DialogTitle>
                    <DialogDescription>
                        Esta acción cancelará el corte del día. Debes proporcionar un código de autorización y un motivo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <p className="text-sm text-blue-700 font-semibold mb-1">ID del Corte a Cancelar</p>
                        <p className="text-2xl font-bold text-blue-900">#{corteID}</p>
                        <p className="text-xs text-blue-600 mt-1">
                            Usa este ID para solicitar el código de autorización al administrador
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="codigo">Código de Autorización *</Label>
                        <Input
                            id="codigo"
                            type="text"
                            placeholder="Ingresa el código"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Solicita el código al administrador
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="motivo">Motivo de Cancelación *</Label>
                        <Textarea
                            id="motivo"
                            placeholder="Describe el motivo de la cancelación"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            disabled={isPending}
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            variant="outline"
                            onClick={handleCerrar}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelar}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Cancelando...
                                </>
                            ) : (
                                "Cancelar Corte"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
