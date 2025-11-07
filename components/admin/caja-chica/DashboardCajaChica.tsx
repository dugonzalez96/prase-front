"use client";

/**
 * DashboardCajaChica.tsx - LEGACY
 * 
 * ⚠️ ESTE COMPONENTE YA NO SE USA
 * Fue reemplazado por la nueva estructura en CajaChicaClient.tsx
 * 
 * Los componentes nuevos que lo reemplazan son:
 * - EncabezadoCajaChica.tsx
 * - TotalesPorMetodo.tsx
 * - CalculosAutomaticos.tsx
 * - TablaDetalleUsuarios.tsx
 */

import { iTotalesPorMetodo } from "@/interfaces/CajaChicaInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Wallet, TrendingDown, TrendingUp, DollarSign, CreditCard, ArrowLeftRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DashboardCajaChicaProps {
    fondoInicial: number;
    totales: iTotalesPorMetodo;
    saldoEsperado: number;
    saldoReal: number;
    pendientesDeCorte: number;
}

export function DashboardCajaChica({ 
    fondoInicial, 
    totales, 
    saldoEsperado, 
    saldoReal,
    pendientesDeCorte 
}: DashboardCajaChicaProps) {
    const porcentajeUsado = fondoInicial > 0 ? ((fondoInicial - saldoEsperado) / fondoInicial) * 100 : 0;
    const porcentajeDisponible = 100 - porcentajeUsado;

    const diferencia = saldoEsperado - saldoReal;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Fondo Inicial */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Fondo Inicial
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(fondoInicial)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Monto asignado al inicio
                    </p>
                </CardContent>
            </Card>

            {/* Total Ingresos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Ingresos
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totales.TotalEfectivo || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ingresos registrados
                    </p>
                </CardContent>
            </Card>

            {/* Total Egresos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Egresos
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Egresos registrados
                    </p>
                </CardContent>
            </Card>

            {/* Saldo Esperado */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saldo Esperado
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(saldoEsperado)}
                    </div>
                    <Progress 
                        value={porcentajeDisponible} 
                        className="mt-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        {porcentajeDisponible.toFixed(1)}% disponible
                    </p>
                </CardContent>
            </Card>

            {/* Total Efectivo */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Efectivo
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totales.TotalEfectivo)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Efectivo en caja
                    </p>
                </CardContent>
            </Card>

            {/* Total Tarjeta */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Tarjeta
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(totales.TotalTarjeta || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Pagos con tarjeta
                    </p>
                </CardContent>
            </Card>

            {/* Total Transferencia */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Transferencia
                    </CardTitle>
                    <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-indigo-600">
                        {formatCurrency(totales.TotalTransferencia || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Transferencias
                    </p>
                </CardContent>
            </Card>

            {/* Diferencia */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Diferencia
                    </CardTitle>
                    <TrendingDown className={`h-4 w-4 ${diferencia === 0 ? 'text-green-500' : 'text-orange-500'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${diferencia === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(Math.abs(diferencia))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {diferencia === 0 ? 'Cuadrado' : diferencia > 0 ? 'Faltante' : 'Sobrante'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
