"use client";

import { iResumenCajaChica } from "@/interfaces/CajaChicaInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Wallet, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DashboardCajaChicaProps {
    resumen: iResumenCajaChica;
}

export function DashboardCajaChica({ resumen }: DashboardCajaChicaProps) {
    const porcentajeUsado = (resumen.TotalGastos / resumen.SaldoInicial) * 100;
    const porcentajeDisponible = 100 - porcentajeUsado;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Saldo Inicial */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saldo Inicial
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(resumen.SaldoInicial)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Monto asignado al inicio del día
                    </p>
                </CardContent>
            </Card>

            {/* Total de Gastos */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Gastos
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(resumen.TotalGastos)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {resumen.CantidadGastos} movimientos registrados
                    </p>
                </CardContent>
            </Card>

            {/* Reposiciones */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Reposiciones
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(resumen.TotalReposiciones)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Reposiciones recibidas hoy
                    </p>
                </CardContent>
            </Card>

            {/* Saldo Disponible */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saldo Disponible
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(resumen.SaldoActual)}
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
        </div>
    );
}
