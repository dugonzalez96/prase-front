"use client";

import { iMovimientoPendiente } from "@/interfaces/ValidacionMovimientosInterface";
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
    XCircle,
    ArrowDownLeft,
    ArrowUpRight
} from "lucide-react";

interface DetalleMovimientoModalProps {
    movimiento: iMovimientoPendiente;
    abierto: boolean;
    onClose: () => void;
    onValidar: (movimientoId: number) => void;
    onRechazar: (movimientoId: number) => void;
}

export function DetalleMovimientoModal({
    movimiento,
    abierto,
    onClose,
    onValidar,
    onRechazar
}: DetalleMovimientoModalProps) {
    const getTipoBadge = (tipo: string) => {
        return tipo === "Ingreso" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Ingreso
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700">
                <ArrowDownLeft className="h-4 w-4 mr-1" />
                Egreso
            </Badge>
        );
    };

    return (
        <Dialog open={abierto} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Detalle del Movimiento #{movimiento.TransaccionID}</span>
                        {getTipoBadge(movimiento.TipoTransaccion)}
                    </DialogTitle>
                    <DialogDescription>
                        Revisa los detalles antes de validar o rechazar el movimiento
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Información del Usuario */}
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Usuario que registró</p>
                            <p className="text-sm text-muted-foreground">
                                {movimiento.UsuarioCreo.NombreUsuario}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Fecha */}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Fecha de transacción</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDateTimeFull(movimiento.FechaTransaccion)}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Forma de Pago */}
                    <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Forma de pago</p>
                            <Badge variant="secondary" className="mt-1">
                                {movimiento.FormaPago}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Cuenta Bancaria */}
                    {movimiento.CuentaBancaria && (
                        <>
                            <div className="flex items-start gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Cuenta bancaria</p>
                                    <p className="text-sm text-muted-foreground">
                                        {movimiento.CuentaBancaria.NombreBanco} - {movimiento.CuentaBancaria.NumeroCuenta}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Descripción */}
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Descripción</p>
                            <p className="text-sm text-muted-foreground">
                                {movimiento.Descripcion}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Monto */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-center text-muted-foreground mb-1">
                            Monto de la transacción
                        </p>
                        <p className="text-3xl font-bold text-center">
                            {formatCurrency(parseFloat(movimiento.Monto))}
                        </p>
                    </div>
                </div>

                {movimiento.Validado === 0 && (
                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onRechazar(movimiento.TransaccionID);
                                onClose();
                            }}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                        </Button>
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                                onValidar(movimiento.TransaccionID);
                                onClose();
                            }}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validar Movimiento
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
