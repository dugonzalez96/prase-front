"use client";

import { iMovimientoCajaChica } from "@/interfaces/CajaChicaInterface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { FileCheck, FileX, TrendingDown, TrendingUp } from "lucide-react";

interface TablaGastosProps {
    movimientos: iMovimientoCajaChica[];
}

export function TablaGastos({ movimientos }: TablaGastosProps) {
    const getTipoIcon = (tipo: string) => {
        return tipo === 'GASTO' ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
        ) : (
            <TrendingUp className="h-4 w-4 text-green-500" />
        );
    };

    if (!movimientos || movimientos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Movimientos del Día</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay movimientos registrados
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Movimientos del Día</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hora</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Comprobante</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movimientos.map((movimiento) => (
                            <TableRow key={movimiento.MovimientoCajaChicaID}>
                                <TableCell className="text-sm">
                                    {formatDateTimeFull(movimiento.FechaMovimiento)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getTipoIcon(movimiento.TipoMovimiento)}
                                        <span className="text-sm">
                                            {movimiento.TipoMovimiento}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{movimiento.Concepto}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{movimiento.Categoria}</Badge>
                                </TableCell>
                                <TableCell className="font-semibold">
                                    {formatCurrency(parseFloat(movimiento.Monto))}
                                </TableCell>
                                <TableCell>
                                    {movimiento.Comprobante ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            <FileCheck className="h-3 w-3 mr-1" />
                                            Sí
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700">
                                            <FileX className="h-3 w-3 mr-1" />
                                            No
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
