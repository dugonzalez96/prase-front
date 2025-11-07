"use client";

/**
 * ListaEgresos.tsx
 * 
 * ✅ FUNCIONA:
 * - Muestra lista de egresos con concepto y monto
 * - UI para botón "Agregar Egreso"
 * - Botón de eliminar por ítem
 * - Total automático calculado
 * 
 * ❌ NO FUNCIONA / FALTA:
 * - Agregar egresos (botón sin handler real) - FALTA: Modal FormAgregarEgreso
 * - Eliminar egresos (botón sin handler real) - FALTA: Backend DELETE /caja-chica/egresos/{id}
 * - Editar egresos - FALTA: Click en fila → Modal edición
 * - Validación de montos negativos
 * - Los datos vienen hardcoded o por props mock
 * 
 * 📝 PARA IMPLEMENTAR:
 * 1. Backend endpoints:
 *    - POST /caja-chica/{id}/egresos → Body: { concepto, monto }
 *    - DELETE /caja-chica/{id}/egresos/{egresoId}
 *    - PATCH /caja-chica/{id}/egresos/{egresoId} → Body: { concepto?, monto? }
 * 2. Crear FormAgregarEgreso.tsx con Zod schema
 * 3. Agregar iEgresoCajaChica[] a iPrecuadreCajaChica
 * 4. Estado local con setEgresos para actualizaciones optimistas
 * 5. Confirmar eliminación con Dialog destructivo
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { Plus, Trash2, Edit } from "lucide-react";
import { iEgresoCajaChica } from "@/interfaces/CajaChicaInterface";

interface ListaEgresosProps {
    egresos?: iEgresoCajaChica[];
    onAgregar?: () => void; // ❌ FALTA: Implementar handler que abra modal
    onEliminar?: (egresoId: number) => void; // ❌ FALTA: Llamar a backend DELETE
    onEditar?: (egreso: iEgresoCajaChica) => void; // ❌ FALTA: Abrir modal edición
    readonly?: boolean; // Para vista de previsualización
}

export function ListaEgresos({
    egresos = [
        // ❌ MOCK DATA - Debe venir de precuadre.Egresos
        { EgresoID: 1, Concepto: "Compra de papelería", Monto: 350.00, Fecha: new Date() },
        { EgresoID: 2, Concepto: "Servicio de mensajería", Monto: 150.00, Fecha: new Date() },
        { EgresoID: 3, Concepto: "Café y agua para oficina", Monto: 280.50, Fecha: new Date() },
    ],
    onAgregar,
    onEliminar,
    onEditar,
    readonly = false
}: ListaEgresosProps) {

    // ✅ FUNCIONA: Cálculo de total
    const totalEgresos = egresos.reduce((sum, egreso) => sum + egreso.Monto, 0);

    // ❌ FALTA: Handler real que llame a API
    const handleAgregarClick = () => {
        if (onAgregar) {
            onAgregar();
        } else {
            console.warn("⚠️ onAgregar no implementado - Debe abrir FormAgregarEgreso");
        }
    };

    // ❌ FALTA: Handler con confirmación y API call
    const handleEliminarClick = (egresoId: number) => {
        if (onEliminar) {
            // TODO: Mostrar Dialog de confirmación
            onEliminar(egresoId);
        } else {
            console.warn("⚠️ onEliminar no implementado - Debe llamar DELETE /egresos/" + egresoId);
        }
    };

    // ❌ FALTA: Handler que abra modal de edición
    const handleEditarClick = (egreso: iEgresoCajaChica) => {
        if (onEditar) {
            onEditar(egreso);
        } else {
            console.warn("⚠️ onEditar no implementado - Debe abrir modal edición");
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Egresos de Caja Chica
                            <Badge variant="secondary">{egresos.length} registros</Badge>
                        </CardTitle>
                        <CardDescription>
                            Gastos realizados desde esta caja
                        </CardDescription>
                    </div>
                    {/* {!readonly && (
                        <Button onClick={handleAgregarClick} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Egreso
                        </Button>
                    )} */}
                </div>
            </CardHeader>
            <CardContent>
                {egresos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No hay egresos registrados</p>
                        {!readonly && (
                            <Button onClick={handleAgregarClick} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar primer egreso
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead className="text-right w-[150px]">Monto</TableHead>
                                    {/* {!readonly && <TableHead className="w-[100px]">Acciones</TableHead>} */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {egresos.map((egreso) => (
                                    <TableRow key={egreso.EgresoID}>
                                        <TableCell className="font-mono text-sm">
                                            {egreso.EgresoID}
                                        </TableCell>
                                        <TableCell>{egreso.Concepto}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(egreso.Monto)}
                                        </TableCell>
                                        {/* ❌ FALTA: Implementar handler editar */}
                                        {/* ❌ FALTA: Implementar handler eliminar con confirmación */}
                                        {/* {!readonly && (
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditarClick(egreso)}
                                                        title="Editar egreso"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEliminarClick(egreso.EgresoID)}
                                                        className="text-destructive"
                                                        title="Eliminar egreso"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )} */}

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Total */}
                        <div className="mt-4 flex justify-end items-center gap-4 border-t pt-4">
                            <span className="text-sm font-medium">Total Egresos:</span>
                            <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                                {formatCurrency(totalEgresos)}
                            </Badge>
                        </div>

                        {/* Nota informativa */}
                        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                            <p className="text-sm text-yellow-800">
                                <strong>Nota:</strong> Los egresos se descuentan del saldo disponible.
                                Asegúrate de tener comprobantes físicos o digitales de cada gasto.
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
