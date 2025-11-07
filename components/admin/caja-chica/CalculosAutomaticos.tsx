"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { Calculator, TrendingDown, TrendingUp, Wallet, Building2 } from "lucide-react";

interface CalculosAutomaticosProps {
    saldoInicial: number;
    totalIngresos: number;
    totalEgresos: number;
    fondoFijo: number;
    onDepositoChange?: (monto: number) => void;
}

export function CalculosAutomaticos({ 
    saldoInicial,
    totalIngresos,
    totalEgresos,
    fondoFijo,
    onDepositoChange
}: CalculosAutomaticosProps) {
    const [depositosBanco, setDepositosBanco] = useState(0);

    const saldoDisponible = saldoInicial + totalIngresos - totalEgresos - depositosBanco;
    const entregaAGeneral = Math.max(0, saldoDisponible - fondoFijo);
    const saldoFinal = saldoDisponible - entregaAGeneral;

    const handleDepositoChange = (value: string) => {
        const monto = parseFloat(value) || 0;
        setDepositosBanco(monto);
        onDepositoChange?.(monto);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Cálculos Automáticos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Saldo Inicial */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Saldo Inicial (del cierre anterior)</span>
                    </div>
                    <span className="text-lg font-bold">{formatCurrency(saldoInicial)}</span>
                </div>

                <Separator />

                {/* Ingresos */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Ingresos de Usuarios</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">+{formatCurrency(totalIngresos)}</span>
                </div>

                {/* Egresos */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Egresos/Gastos</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">-{formatCurrency(totalEgresos)}</span>
                </div>

                {/* Depósitos a Banco (editable) */}
                <div className="space-y-2 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <Label htmlFor="depositosBanco" className="text-sm font-medium">
                            Depósitos a Banco del Día
                        </Label>
                    </div>
                    <Input
                        id="depositosBanco"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={depositosBanco || ""}
                        onChange={(e) => handleDepositoChange(e.target.value)}
                        className="font-bold"
                    />
                    <p className="text-xs text-muted-foreground">
                        Reduce el saldo físico disponible en caja
                    </p>
                </div>

                <Separator className="my-4" />

                {/* Saldo Disponible */}
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                    <span className="font-semibold">Saldo Disponible</span>
                    <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(saldoDisponible)}
                    </span>
                </div>

                {/* Fondo Fijo (referencia) */}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Fondo Fijo (a mantener)</span>
                    <span className="font-semibold">{formatCurrency(fondoFijo)}</span>
                </div>

                <Separator className="my-4" />

                {/* Entrega a General */}
                <div className="flex justify-between items-center p-4 bg-green-50 border-2 border-green-200 rounded-md">
                    <div>
                        <p className="font-semibold text-green-800">Entrega a Caja General</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            max(0, saldo_disponible - fondo_fijo)
                        </p>
                    </div>
                    <Badge variant="default" className="bg-green-600 text-lg px-4 py-2">
                        {formatCurrency(entregaAGeneral)}
                    </Badge>
                </div>

                {/* Saldo Final */}
                <div className="flex justify-between items-center p-4 bg-purple-50 border-2 border-purple-200 rounded-md">
                    <div>
                        <p className="font-semibold text-purple-800">Saldo Final en Caja Chica</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Debe ser igual al Fondo Fijo
                        </p>
                    </div>
                    <Badge 
                        variant={Math.abs(saldoFinal - fondoFijo) < 0.01 ? "default" : "destructive"}
                        className={`text-lg px-4 py-2 ${Math.abs(saldoFinal - fondoFijo) < 0.01 ? 'bg-green-600' : ''}`}
                    >
                        {formatCurrency(saldoFinal)}
                    </Badge>
                </div>

                {/* Validación */}
                {Math.abs(saldoFinal - fondoFijo) > 0.01 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-sm text-orange-800 font-medium">
                            ⚠ El saldo final difiere del fondo fijo en{" "}
                            {formatCurrency(Math.abs(saldoFinal - fondoFijo))}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
