"use client";

import { iResumenCajaGeneral } from "@/interfaces/CajaGeneralInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { DollarSign, TrendingDown, TrendingUp, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardCajaGeneralProps {
    resumen: iResumenCajaGeneral;
}

export function DashboardCajaGeneral({ resumen }: DashboardCajaGeneralProps) {
    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'ABIERTA':
                return <Badge variant="outline" className="bg-green-50 text-green-700">Abierta</Badge>;
            case 'PRECUADRE':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Precuadre</Badge>;
            case 'CUADRADA':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700">Cuadrada</Badge>;
            case 'CERRADA':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700">Cerrada</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
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
                            Al inicio del día
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
                            {formatCurrency(resumen.TotalIngresos)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ingresos del día
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
                            {formatCurrency(resumen.TotalEgresos)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Egresos del día
                        </p>
                    </CardContent>
                </Card>

                {/* Saldo Actual */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Saldo Actual
                        </CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(resumen.SaldoActual)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Estado: {getEstadoBadge(resumen.Estado)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Resumen de Cortes */}
            <Card>
                <CardHeader>
                    <CardTitle>Estado de Cortes de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Cortes Validados</p>
                            <p className="text-3xl font-bold text-green-600">{resumen.CortesValidados}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Cortes Pendientes</p>
                            <p className="text-3xl font-bold text-yellow-600">{resumen.CortesPendientes}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
