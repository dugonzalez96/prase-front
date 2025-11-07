"use client";

/**
 * TablaEgresos.tsx
 * 
 * Tabla de egresos registrados en Caja Chica.
 * Muestra todos los movimientos de tipo "Egreso" del catálogo.
 * 
 * ✅ FUNCIONA:
 * - Lista de egresos filtrados
 * - Visualización por forma de pago
 * - Información de validación
 * - Total de egresos
 * 
 * 🔗 INTEGRADO CON:
 * - MovimientosActions: getMovimientos()
 * - iGetMovimientos interface
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { formatDateTimeFull } from "@/lib/format-date";
import { iGetMovimientos } from "@/interfaces/MovimientosInterface";
import { TrendingDown } from "lucide-react";

interface TablaEgresosProps {
    movimientos: iGetMovimientos[];
}

export function TablaEgresos({ movimientos }: TablaEgresosProps) {
    // Filtrar solo egresos
    const egresos = movimientos.filter(m => m.TipoTransaccion === "Egreso");

    // Calcular totales
    const totalEgresos = egresos.reduce((sum, egreso) => sum + Number(egreso.Monto), 0);
    const egresosValidados = egresos.filter(e => e.Validado === 1).length;
    const egresosPendientes = egresos.filter(e => e.Validado === 0).length;

    if (egresos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                        Egresos Registrados
                    </CardTitle>
                    <CardDescription>
                        Movimientos de egreso del catálogo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay egresos registrados
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            Egresos Registrados
                            <Badge variant="secondary">{egresos.length} registros</Badge>
                        </CardTitle>
                        <CardDescription>
                            {egresosValidados} validados, {egresosPendientes} pendientes
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Egresos</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalEgresos)}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Forma de Pago</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Descripción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {egresos.map((egreso) => (
                            <TableRow key={egreso.TransaccionID}>
                                <TableCell className="font-mono text-sm">
                                    {egreso.TransaccionID}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatDateTimeFull(egreso.FechaTransaccion)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {egreso.FormaPago}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-red-600">
                                    -{formatCurrency(Number(egreso.Monto))}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {egreso.UsuarioCreo.NombreUsuario}
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={egreso.Validado === 1 ? "default" : "secondary"}
                                    >
                                        {egreso.Validado === 1 ? "Validado" : "Pendiente"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {egreso.Descripcion || "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Resumen por forma de pago */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Efectivo", "Tarjeta", "Transferencia", "Deposito"].map((forma) => {
                        const totalPorForma = egresos
                            .filter(e => e.FormaPago === forma)
                            .reduce((sum, e) => sum + Number(e.Monto), 0);
                        
                        if (totalPorForma === 0) return null;

                        return (
                            <div key={forma} className="p-3 border rounded-lg">
                                <p className="text-xs text-muted-foreground">{forma}</p>
                                <p className="text-lg font-bold text-red-600">
                                    {formatCurrency(totalPorForma)}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Nota informativa */}
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-800">
                        <strong>📤 Total de Egresos:</strong> {formatCurrency(totalEgresos)}.
                        {egresosPendientes > 0 && (
                            <> Hay {egresosPendientes} egreso(s) pendiente(s) de validación.</>
                        )}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
