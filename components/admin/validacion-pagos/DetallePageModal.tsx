"use client";

import { iPagoPendiente } from "@/interfaces/PagosPolizaInterface";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { 
    User, 
    Calendar, 
    CreditCard, 
    FileText, 
    Building2,
    CheckCircle,
    DollarSign
} from "lucide-react";

interface DetallePageModalProps {
    pago: iPagoPendiente;
    abierto: boolean;
    onClose: () => void;
    onValidar: (pagoID: number) => void;
}

export function DetallePageModal({
    pago,
    abierto,
    onClose,
    onValidar
}: DetallePageModalProps) {
    return (
        <Dialog open={abierto} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalle del Pago #{pago.PagoID}</span>
                        <Badge variant="secondary">Póliza #{pago.PolizaID}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Revisa los detalles antes de validar el pago
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Información del Usuario */}
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Usuario que registró</p>
                            <p className="text-sm text-muted-foreground">
                                {pago.Usuario.NombreUsuario}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Fecha de Pago */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Fecha de pago</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDateTimeFull(new Date(pago.FechaPago))}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Método de Pago */}
                    <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Método de pago</p>
                            <Badge variant="secondary" className="mt-1">
                                {pago.MetodoPago.NombreMetodo}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Estatus del Pago */}
                    <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Estatus del pago</p>
                            <Badge variant="outline" className="mt-1">
                                {pago.EstatusPago.NombreEstatus}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Referencia de Pago */}
                    {pago.ReferenciaPago && (
                        <>
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Referencia de pago</p>
                                    <p className="text-sm text-muted-foreground">
                                        {pago.ReferenciaPago}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Nombre del Titular */}
                    {pago.NombreTitular && (
                        <>
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Nombre del titular</p>
                                    <p className="text-sm text-muted-foreground">
                                        {pago.NombreTitular}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Monto */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <p className="text-sm font-medium text-center text-muted-foreground">
                                Monto del pago
                            </p>
                        </div>
                        <p className="text-3xl font-bold text-center">
                            {formatCurrency(parseFloat(pago.MontoPagado))}
                        </p>
                    </div>
                </div>

                {pago.Validado === 0 && (
                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                onValidar(pago.PagoID);
                                onClose();
                            }}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validar Pago
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
