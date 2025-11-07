"use client";

/**
 * TablaIngresos.tsx
 * 
 * Tabla de ingresos registrados en Caja Chica.
 * Muestra todos los movimientos de tipo "Ingreso" del catálogo.
 * 
 * ✅ FUNCIONA:
 * - Lista de ingresos filtrados
 * - Visualización por forma de pago
 * - Información de validación
 * - Total de ingresos
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
import { TrendingUp } from "lucide-react";

interface TablaIngresosProps {
    movimientos: iGetMovimientos[];
}

export function TablaIngresos({ movimientos }: TablaIngresosProps) {
    // Filtrar solo ingresos
    const ingresos = movimientos.filter(m => m.TipoTransaccion === "Ingreso");

    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, ingreso) => sum + Number(ingreso.Monto), 0);
    const ingresosValidados = ingresos.filter(i => i.Validado === 1).length;
    const ingresosPendientes = ingresos.filter(i => i.Validado === 0).length;

    if (ingresos.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Ingresos Registrados
                    </CardTitle>
                    <CardDescription>
                        Movimientos de ingreso del catálogo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay ingresos registrados
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
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Ingresos Registrados
                            <Badge variant="secondary">{ingresos.length} registros</Badge>
                        </CardTitle>
                        <CardDescription>
                            {ingresosValidados} validados, {ingresosPendientes} pendientes
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Ingresos</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalIngresos)}
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
                        {ingresos.map((ingreso) => (
                            <TableRow key={ingreso.TransaccionID}>
                                <TableCell className="font-mono text-sm">
                                    {ingreso.TransaccionID}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatDateTimeFull(ingreso.FechaTransaccion)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {ingreso.FormaPago}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                    +{formatCurrency(Number(ingreso.Monto))}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {ingreso.UsuarioCreo.NombreUsuario}
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={ingreso.Validado === 1 ? "default" : "secondary"}
                                    >
                                        {ingreso.Validado === 1 ? "Validado" : "Pendiente"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {ingreso.Descripcion || "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Resumen por forma de pago */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Efectivo", "Tarjeta", "Transferencia", "Deposito"].map((forma) => {
                        const totalPorForma = ingresos
                            .filter(i => i.FormaPago === forma)
                            .reduce((sum, i) => sum + Number(i.Monto), 0);
                        
                        if (totalPorForma === 0) return null;

                        return (
                            <div key={forma} className="p-3 border rounded-lg">
                                <p className="text-xs text-muted-foreground">{forma}</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(totalPorForma)}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Nota informativa */}
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800">
                        <strong>💰 Total de Ingresos:</strong> {formatCurrency(totalIngresos)}.
                        {ingresosPendientes > 0 && (
                            <> Hay {ingresosPendientes} ingreso(s) pendiente(s) de validación.</>
                        )}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
