"use client";

import { useState } from "react";
import { iMovimientoPendiente } from "@/interfaces/ValidacionMovimientosInterface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { Eye, CheckCircle, XCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DetalleMovimientoModal } from "./DetalleMovimientoModal";

interface TablaMovimientosPendientesProps {
    movimientos: iMovimientoPendiente[];
    onValidar: (movimientoId: number) => void;
}

export function TablaMovimientosPendientes({
    movimientos,
    onValidar
}: TablaMovimientosPendientesProps) {
    console.log("🚀 ~ TablaMovimientosPendientes ~ movimientos:", movimientos)
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<iMovimientoPendiente | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const abrirDetalle = (movimiento: iMovimientoPendiente) => {
        setMovimientoSeleccionado(movimiento);
        setModalAbierto(true);
    };

    const getEstadoBadge = (validado: number) => {
        switch (validado) {
            case 0:
                return <Badge variant="outline" className="bg-yellow-50">Pendiente</Badge>;
            case 1:
                return <Badge variant="outline" className="bg-green-50 text-green-700">Validado</Badge>;
            default:
                return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    const getTipoBadge = (tipo: string) => {
        return tipo === "Ingreso" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Ingreso
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700">
                <ArrowDownLeft className="h-3 w-3 mr-1" />
                Egreso
            </Badge>
        );
    };

    if (!movimientos || movimientos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Movimientos Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay movimientos pendientes de validación
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Movimientos Pendientes</span>
                        <Badge variant="default">{movimientos.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Forma de Pago</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movimientos.map((movimiento) => (
                                <TableRow key={movimiento.TransaccionID}>
                                    <TableCell className="font-medium">
                                        #{movimiento.TransaccionID}
                                    </TableCell>
                                    <TableCell>{movimiento.UsuarioCreo.NombreUsuario}</TableCell>
                                    <TableCell>{getTipoBadge(movimiento.TipoTransaccion)}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{movimiento.FormaPago}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(parseFloat(movimiento.Monto))}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTimeFull(new Date(movimiento.FechaTransaccion))}
                                    </TableCell>
                                    <TableCell>{getEstadoBadge(movimiento.Validado)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => abrirDetalle(movimiento)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Ver
                                            </Button>
                                            {movimiento.Validado === 0 && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => onValidar(movimiento.TransaccionID)}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Validar
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {movimientoSeleccionado && (
                <DetalleMovimientoModal
                    movimiento={movimientoSeleccionado}
                    abierto={modalAbierto}
                    onClose={() => {
                        setModalAbierto(false);
                        setMovimientoSeleccionado(null);
                    }}
                    onValidar={onValidar}
                />
            )}
        </>
    );
}
