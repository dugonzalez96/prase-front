"use client";

import { iEgresoCajaChica } from "@/interfaces/CajaChicaInterface";
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
import { TrendingDown } from "lucide-react";

interface TablaGastosProps {
    movimientos: iEgresoCajaChica[];
}

export function TablaGastos({ movimientos }: TablaGastosProps) {
    if (!movimientos || movimientos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gastos del Día</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay gastos registrados
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Gastos del Día
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Usuario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movimientos.map((movimiento) => (
                            <TableRow key={movimiento.EgresoID}>
                                <TableCell className="text-sm">
                                    {movimiento.Fecha instanceof Date 
                                        ? movimiento.Fecha.toLocaleDateString('es-MX')
                                        : new Date(movimiento.Fecha).toLocaleDateString('es-MX')
                                    }
                                </TableCell>
                                <TableCell>{movimiento.Concepto}</TableCell>
                                <TableCell className="font-semibold text-red-600">
                                    -{formatCurrency(movimiento.Monto)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {movimiento.Usuario || 'Sistema'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
