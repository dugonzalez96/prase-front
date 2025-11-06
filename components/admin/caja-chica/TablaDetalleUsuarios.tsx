"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Users, AlertTriangle, CheckCircle } from "lucide-react";

interface CorteUsuario {
    UsuarioID: number;
    NombreUsuario: string;
    CorteID: number;
    Efectivo: number;
    Tarjeta: number;
    Transferencia: number;
    DepositoVentanilla: number;
    Egresos: number;
    MontoTeorico: number;
    Diferencia: number;
    Estado: 'PENDIENTE' | 'VALIDADO' | 'CON_DIFERENCIA';
}

interface TablaDetalleUsuariosProps {
    cortes: CorteUsuario[];
}

export function TablaDetalleUsuarios({ cortes }: TablaDetalleUsuariosProps) {
    const getEstadoBadge = (estado: string, diferencia: number) => {
        if (estado === 'PENDIENTE') {
            return <Badge variant="secondary">Pendiente</Badge>;
        }
        if (Math.abs(diferencia) > 0.01) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Con Diferencia
                </Badge>
            );
        }
        return (
            <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Validado
            </Badge>
        );
    };

    const getDiferenciaColor = (diferencia: number) => {
        if (Math.abs(diferencia) < 0.01) return "text-green-600 font-semibold";
        if (diferencia > 0) return "text-orange-600 font-semibold";
        return "text-blue-600 font-semibold";
    };

    const totalRow = {
        Efectivo: cortes.reduce((sum, c) => sum + c.Efectivo, 0),
        Tarjeta: cortes.reduce((sum, c) => sum + c.Tarjeta, 0),
        Transferencia: cortes.reduce((sum, c) => sum + c.Transferencia, 0),
        DepositoVentanilla: cortes.reduce((sum, c) => sum + c.DepositoVentanilla, 0),
        Egresos: cortes.reduce((sum, c) => sum + c.Egresos, 0),
        MontoTeorico: cortes.reduce((sum, c) => sum + c.MontoTeorico, 0),
        Diferencia: cortes.reduce((sum, c) => sum + c.Diferencia, 0)
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Detalle de Cortes de Usuario
                </CardTitle>
                <CardDescription>
                    Resumen de todos los cortes de caja de usuarios del día
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold">Usuario</TableHead>
                                <TableHead className="text-right">Efectivo</TableHead>
                                <TableHead className="text-right">Tarjeta</TableHead>
                                <TableHead className="text-right">Transferencia</TableHead>
                                <TableHead className="text-right">Depósito</TableHead>
                                <TableHead className="text-right">Egresos</TableHead>
                                <TableHead className="text-right">Teórico</TableHead>
                                <TableHead className="text-right">Diferencia</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cortes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                        No hay cortes de usuario registrados para este día
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {cortes.map((corte) => (
                                        <TableRow key={corte.CorteID}>
                                            <TableCell className="font-medium">
                                                {corte.NombreUsuario}
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    #{corte.CorteID}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-green-600">
                                                {formatCurrency(corte.Efectivo)}
                                            </TableCell>
                                            <TableCell className="text-right text-purple-600">
                                                {formatCurrency(corte.Tarjeta)}
                                            </TableCell>
                                            <TableCell className="text-right text-blue-600">
                                                {formatCurrency(corte.Transferencia)}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-600">
                                                {formatCurrency(corte.DepositoVentanilla)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600">
                                                {formatCurrency(corte.Egresos)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(corte.MontoTeorico)}
                                            </TableCell>
                                            <TableCell className={`text-right ${getDiferenciaColor(corte.Diferencia)}`}>
                                                {formatCurrency(Math.abs(corte.Diferencia))}
                                                {corte.Diferencia > 0.01 && " ↓"}
                                                {corte.Diferencia < -0.01 && " ↑"}
                                            </TableCell>
                                            <TableCell>
                                                {getEstadoBadge(corte.Estado, corte.Diferencia)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Fila de totales */}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell>TOTALES</TableCell>
                                        <TableCell className="text-right text-green-700">
                                            {formatCurrency(totalRow.Efectivo)}
                                        </TableCell>
                                        <TableCell className="text-right text-purple-700">
                                            {formatCurrency(totalRow.Tarjeta)}
                                        </TableCell>
                                        <TableCell className="text-right text-blue-700">
                                            {formatCurrency(totalRow.Transferencia)}
                                        </TableCell>
                                        <TableCell className="text-right text-orange-700">
                                            {formatCurrency(totalRow.DepositoVentanilla)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-700">
                                            {formatCurrency(totalRow.Egresos)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(totalRow.MontoTeorico)}
                                        </TableCell>
                                        <TableCell className={`text-right ${getDiferenciaColor(totalRow.Diferencia)}`}>
                                            {formatCurrency(Math.abs(totalRow.Diferencia))}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
