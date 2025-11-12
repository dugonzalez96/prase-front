"use client";

import { useState } from "react";
import { iPagoPendiente } from "@/interfaces/PagosPolizaInterface";
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
import { Eye, CheckCircle } from "lucide-react";
import { DetallePageModal } from "./DetallePageModal";

interface TablaPagosPendientesProps {
    pagos: iPagoPendiente[];
    onValidar: (pagoID: number) => void;
}

export function TablaPagosPendientes({
    pagos,
    onValidar
}: TablaPagosPendientesProps) {
    const [pagoSeleccionado, setPagoSeleccionado] = useState<iPagoPendiente | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    const abrirDetalle = (pago: iPagoPendiente) => {
        setPagoSeleccionado(pago);
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

    if (!pagos || pagos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Pendientes de Validación</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay pagos pendientes de validación
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
                        <span>Pagos Pendientes de Validación</span>
                        <Badge variant="default">{pagos.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Póliza</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Método de Pago</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Fecha Pago</TableHead>
                                <TableHead>Estatus</TableHead>
                                <TableHead>Validación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagos.map((pago) => (
                                <TableRow key={pago.PagoID}>
                                    <TableCell className="font-medium">
                                        #{pago.PagoID}
                                    </TableCell>
                                    <TableCell>
                                        #{pago.PolizaID}
                                    </TableCell>
                                    <TableCell>{pago.Usuario.NombreUsuario}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{pago.MetodoPago.NombreMetodo}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(parseFloat(pago.MontoPagado))}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTimeFull(new Date(pago.FechaPago))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{pago.EstatusPago.NombreEstatus}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getEstadoBadge(pago.Validado)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => abrirDetalle(pago)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Ver
                                            </Button>
                                            {pago.Validado === 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => onValidar(pago.PagoID)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Validar
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {pagoSeleccionado && (
                <DetallePageModal
                    pago={pagoSeleccionado}
                    abierto={modalAbierto}
                    onClose={() => {
                        setModalAbierto(false);
                        setPagoSeleccionado(null);
                    }}
                    onValidar={onValidar}
                />
            )}
        </>
    );
}
