"use client";

/**
 * ModalPrevisualizar.tsx
 * 
 * ✅ FUNCIONA:
 * - Modal de previsualización antes de cerrar la caja
 * - Muestra resumen completo: info, totales, cálculos, detalle usuarios, egresos
 * - Botón "Cerrar Definitivamente" que llama a handler externo
 * - UI responsiva con scroll interno
 * 
 * ❌ NO FUNCIONA / FALTA:
 * - Los datos vienen por props (no refresca automático) - FALTA: Botón "Actualizar datos"
 * - No valida que todos los usuarios estén validados - FALTA: Lógica de bloqueo si hay pendientes
 * - No muestra advertencias si diferencia > umbral - FALTA: Alert de diferencias altas
 * - Handler onCerrar sin implementación real - FALTA: Llamar a cuadrarCajaChica()
 * 
 * 📝 PARA IMPLEMENTAR:
 * 1. Pasar precuadre completo desde CajaChicaClient
 * 2. Validar: precuadre.CortesUsuarios.every(c => c.Estado === "VALIDADO")
 * 3. Calcular alertas: if (Math.abs(diferencia) > 500) → mostrar Alert
 * 4. Botón "Actualizar" que llame a fetchPrecuadre() del cliente
 * 5. onCerrar debe invocar FormCuadrarCajaChica o directamente cuadrarCajaChica()
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { AlertCircle, CheckCircle2, Lock, RefreshCw } from "lucide-react";
import { iPrecuadreCajaChica } from "@/interfaces/CajaChicaInterface";

interface ModalPrevisualizarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    precuadre?: iPrecuadreCajaChica; // ❌ DEBE PASAR desde CajaChicaClient
    onCerrar?: () => void; // ❌ FALTA: Implementar handler que ejecute cuadre
    onActualizar?: () => void; // ❌ FALTA: Refrescar datos
}

export function ModalPrevisualizar({
    open,
    onOpenChange,
    precuadre,
    onCerrar,
    onActualizar
}: ModalPrevisualizarProps) {

    // ❌ MOCK DATA si no hay precuadre
    const mockPrecuadre: iPrecuadreCajaChica = {
        Info: {
            CajaChicaID: 1,
            SucursalID: 1,
            NombreSucursal: "Centro",
            NombreCaja: "Mostrador #10",
            FechaCorte: new Date(),
            FondoFijo: 5000
        },
        TotalesPorMetodo: {
            TotalEfectivo: 12500,
            TotalTarjeta: 8300,
            TotalTransferencia: 4200,
            TotalDepositoVentanilla: 1500
        },
        Calculos: {
            SaldoInicial: 5000,
            IngresosUsuarios: {
                TotalEfectivo: 12500,
                TotalTarjeta: 8300,
                TotalTransferencia: 4200,
                TotalDepositoVentanilla: 1500
            },
            TotalIngresos: 26500,
            TotalEgresos: 780.50,
            TotalDepositosBanco: 0,
            SaldoDisponible: 30719.50,
            EntregaAGeneral: 25719.50,
            SaldoFinal: 5000
        },
        CortesUsuarios: [
            {
                UsuarioID: 1,
                NombreUsuario: "Juan Pérez",
                CorteID: 101,
                Efectivo: 5000,
                Tarjeta: 3000,
                Transferencia: 2000,
                DepositoVentanilla: 500,
                Egresos: 200,
                MontoTeorico: 10300,
                Diferencia: 0,
                Estado: "VALIDADO"
            },
            {
                UsuarioID: 2,
                NombreUsuario: "María López",
                CorteID: 102,
                Efectivo: 7500,
                Tarjeta: 5300,
                Transferencia: 2200,
                DepositoVentanilla: 1000,
                Egresos: 580.50,
                MontoTeorico: 15419.50,
                Diferencia: 0,
                Estado: "VALIDADO"
            }
        ],
        Egresos: [
            { EgresoID: 1, Concepto: "Papelería", Monto: 350, Fecha: new Date() },
            { EgresoID: 2, Concepto: "Mensajería", Monto: 150, Fecha: new Date() },
            { EgresoID: 3, Concepto: "Café oficina", Monto: 280.50, Fecha: new Date() }
        ],
        DepositosBanco: [],
        UsuariosPendientes: [],
        PendientesDeCorte: 0,
        mensajes: []
    };

    // Si precuadre está vacío o no tiene la estructura correcta, usar mock
    const data = (precuadre && precuadre.CortesUsuarios) ? precuadre : mockPrecuadre;

    // ✅ FUNCIONA: Validación de usuarios pendientes (con protección undefined)
    const hayPendientes = data.CortesUsuarios?.some(c => c.Estado !== "VALIDADO") ?? false;
    const hayDiferencias = data.CortesUsuarios?.some(c => Math.abs(c.Diferencia) > 0) ?? false;
    const diferenciaTotal = data.CortesUsuarios?.reduce((sum, c) => sum + c.Diferencia, 0) ?? 0;

    // ❌ FALTA: Handler real que ejecute cuadrarCajaChica
    const handleCerrarDefinitivo = () => {
        if (onCerrar) {
            onCerrar();
        } else {
            console.warn("⚠️ onCerrar no implementado - Debe llamar a cuadrarCajaChica()");
        }
    };

    // ❌ FALTA: Handler que llame a fetchPrecuadre
    const handleActualizar = () => {
        if (onActualizar) {
            onActualizar();
        } else {
            console.warn("⚠️ onActualizar no implementado - Debe refrescar datos");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Previsualización - Cierre de Caja Chica</DialogTitle>
                    <DialogDescription>
                        Revisa todos los datos antes de cerrar definitivamente. Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Alertas */}
                    {hayPendientes && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>⚠️ Hay usuarios con cortes pendientes de validación.</strong> 
                                No se puede cerrar la caja hasta que todos los usuarios sean validados.
                            </AlertDescription>
                        </Alert>
                    )}

                    {hayDiferencias && !hayPendientes && (
                        <Alert variant="default" className="border-orange-500 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Diferencia detectada:</strong> {formatCurrency(Math.abs(diferenciaTotal))} 
                                {diferenciaTotal > 0 ? " a favor" : " faltante"}. 
                                Verifica antes de cerrar.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!hayPendientes && !hayDiferencias && (
                        <Alert variant="default" className="border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                ✅ Todos los cortes están validados y sin diferencias. Listo para cerrar.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Sucursal</p>
                                <p className="font-semibold">{data.Info.NombreSucursal}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Caja</p>
                                <p className="font-semibold">{data.Info.NombreCaja}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha Corte</p>
                                <p className="font-semibold">
                                    {data.Info.FechaCorte.toLocaleDateString('es-MX')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fondo Fijo</p>
                                <p className="font-semibold">{formatCurrency(data.Info.FondoFijo)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Totales por Método */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Totales por Método de Pago</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Efectivo</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(data.TotalesPorMetodo.TotalEfectivo)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Tarjeta</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {formatCurrency(data.TotalesPorMetodo.TotalTarjeta)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">SPEI</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {formatCurrency(data.TotalesPorMetodo.TotalTransferencia)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Depósito</p>
                                <p className="text-lg font-bold text-orange-600">
                                    {formatCurrency(data.TotalesPorMetodo.TotalDepositoVentanilla)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Cálculos Finales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cálculos Finales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Saldo Inicial:</span>
                                <span className="font-semibold">{formatCurrency(data.Calculos.SaldoInicial)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>+ Ingresos:</span>
                                <span className="font-semibold">{formatCurrency(data.Calculos.TotalIngresos)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>- Egresos:</span>
                                <span className="font-semibold">{formatCurrency(data.Calculos.TotalEgresos)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>- Depósitos a Banco:</span>
                                <span className="font-semibold">{formatCurrency(data.Calculos.TotalDepositosBanco)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Saldo Disponible:</span>
                                <span>{formatCurrency(data.Calculos.SaldoDisponible)}</span>
                            </div>
                            <div className="flex justify-between text-blue-600 font-semibold">
                                <span>Entrega a Caja General:</span>
                                <span>{formatCurrency(data.Calculos.EntregaAGeneral)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-xl font-bold text-primary">
                                <span>Saldo Final (Fondo Fijo):</span>
                                <span>{formatCurrency(data.Calculos.SaldoFinal)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Resumen Usuarios */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen por Usuario ({data.CortesUsuarios.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {data.CortesUsuarios.map((corte) => (
                                    <div key={corte.UsuarioID} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{corte.NombreUsuario}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Teórico: {formatCurrency(corte.MontoTeorico)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {corte.Diferencia !== 0 && (
                                                <Badge variant={corte.Diferencia > 0 ? "default" : "destructive"}>
                                                    {corte.Diferencia > 0 ? "+" : ""}
                                                    {formatCurrency(corte.Diferencia)}
                                                </Badge>
                                            )}
                                            <Badge variant={
                                                corte.Estado === "VALIDADO" ? "default" :
                                                corte.Estado === "CON_DIFERENCIA" ? "secondary" :
                                                "outline"
                                            }>
                                                {corte.Estado}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleActualizar}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar Datos
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCerrarDefinitivo}
                        disabled={hayPendientes}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Lock className="mr-2 h-4 w-4" />
                        Cerrar Definitivamente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
