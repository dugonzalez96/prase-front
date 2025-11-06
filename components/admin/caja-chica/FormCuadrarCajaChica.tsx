"use client";

/**
 * FormCuadrarCajaChica.tsx
 * 
 * ✅ FUNCIONA:
 * - Formulario con React Hook Form + Zod simple
 * - Cálculos automáticos: Saldo Disponible, Entrega a General, Saldo Final
 * - Loading states y validación básica
 * 
 * ⚠️ NOTA: 
 * - Usa schema simplificado interno (no depende de schema compartido)
 * - Backend debe validar estructura completa iCuadrarCajaChica
 * 
 * 📝 FALTA IMPLEMENTAR:
 * - Backend POST /caja-chica/cuadrar/{id}
 * - Generar PDF de comprobante
 * - Auditoría de cambios
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { iPrecuadreCajaChica, iCuadrarCajaChica } from "@/interfaces/CajaChicaInterface";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calculator, DollarSign, CheckCircle, Lock } from "lucide-react";

// Schema local simplificado
const formCuadrarSchema = z.object({
    TotalEfectivo: z.number().min(0, "No puede ser negativo"),
    TotalTarjeta: z.number().min(0, "No puede ser negativo"),
    TotalTransferencia: z.number().min(0, "No puede ser negativo"),
    TotalDepositoVentanilla: z.number().min(0, "No puede ser negativo"),
    TotalEgresos: z.number().min(0, "No puede ser negativo"),
    TotalDepositosBanco: z.number().min(0, "No puede ser negativo"),
    Observaciones: z.string().optional().default("")
});

type FormData = z.infer<typeof formCuadrarSchema>;

interface FormCuadrarCajaChicaProps {
    precuadre: iPrecuadreCajaChica;
    onSubmit: (data: iCuadrarCajaChica) => Promise<void>;
    isLoading?: boolean;
}

export function FormCuadrarCajaChica({ 
    precuadre, 
    onSubmit,
    isLoading = false 
}: FormCuadrarCajaChicaProps) {
    const [saldoDisponible, setSaldoDisponible] = useState(0);
    const [entregaAGeneral, setEntregaAGeneral] = useState(0);
    const [saldoFinal, setSaldoFinal] = useState(0);

    const fondoFijo = precuadre.Info?.FondoFijo || 0;
    const totalIngresos = precuadre.Calculos?.TotalIngresos || 0;
    const totalEgresos = precuadre.Calculos?.TotalEgresos || 0;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(formCuadrarSchema),
        defaultValues: {
            TotalEfectivo: precuadre.TotalesPorMetodo?.TotalEfectivo || 0,
            TotalTarjeta: precuadre.TotalesPorMetodo?.TotalTarjeta || 0,
            TotalTransferencia: precuadre.TotalesPorMetodo?.TotalTransferencia || 0,
            TotalDepositoVentanilla: precuadre.TotalesPorMetodo?.TotalDepositoVentanilla || 0,
            TotalEgresos: totalEgresos,
            TotalDepositosBanco: precuadre.Calculos?.TotalDepositosBanco || 0,
            Observaciones: ""
        }
    });

    // Watch campos
    const efectivo = watch("TotalEfectivo") || 0;
    const tarjeta = watch("TotalTarjeta") || 0;
    const transferencia = watch("TotalTransferencia") || 0;
    const depositoVentanilla = watch("TotalDepositoVentanilla") || 0;
    const egresos = watch("TotalEgresos") || 0;
    const depositosBanco = watch("TotalDepositosBanco") || 0;

    // ✅ FUNCIONA: Cálculos automáticos
    useEffect(() => {
        const saldo = fondoFijo + efectivo + tarjeta + transferencia + 
                      depositoVentanilla - egresos - depositosBanco;
        setSaldoDisponible(saldo);

        const entrega = Math.max(0, saldo - fondoFijo);
        setEntregaAGeneral(entrega);

        const final = saldo - entrega;
        setSaldoFinal(final);
    }, [efectivo, tarjeta, transferencia, depositoVentanilla, egresos, depositosBanco, fondoFijo]);

    // ✅ FUNCIONA: Envío del formulario
    const handleFormSubmit = async (data: FormData) => {
        const cuadreData: iCuadrarCajaChica = {
            ...data,
            EntregaAGeneral: entregaAGeneral,
            SaldoFinal: saldoFinal
        };
        await onSubmit(cuadreData);
    };

    // Validar si hay usuarios pendientes
    const hayUsuariosPendientes = precuadre.PendientesDeCorte > 0;

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Alerta de usuarios pendientes */}
            {hayUsuariosPendientes && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>No puedes cuadrar la caja.</strong> Hay {precuadre.PendientesDeCorte} usuario(s) 
                        con cortes pendientes de validación.
                    </AlertDescription>
                </Alert>
            )}

            {/* Información del precuadre */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Resumen Actual
                    </CardTitle>
                    <CardDescription>
                        Datos calculados del sistema
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                        <Label className="text-muted-foreground">Fondo Fijo</Label>
                        <p className="text-2xl font-bold">{formatCurrency(fondoFijo)}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Total Ingresos</Label>
                        <p className="text-xl font-semibold text-green-600">{formatCurrency(totalIngresos)}</p>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Total Egresos</Label>
                        <p className="text-xl font-semibold text-red-600">{formatCurrency(totalEgresos)}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Campos de captura - Nueva estructura con iCuadrarCajaChica */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Montos Finales de Cierre
                    </CardTitle>
                    <CardDescription>
                        Confirma los totales (pre-llenados del sistema)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Total Efectivo */}
                        <div className="space-y-2">
                            <Label htmlFor="efectivo">Total Efectivo *</Label>
                            <Input
                                id="efectivo"
                                type="number"
                                step="0.01"
                                {...register("TotalEfectivo", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalEfectivo && (
                                <p className="text-sm text-red-500">{errors.TotalEfectivo.message}</p>
                            )}
                        </div>

                        {/* Total Tarjeta */}
                        <div className="space-y-2">
                            <Label htmlFor="tarjeta">Total Tarjeta *</Label>
                            <Input
                                id="tarjeta"
                                type="number"
                                step="0.01"
                                {...register("TotalTarjeta", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalTarjeta && (
                                <p className="text-sm text-red-500">{errors.TotalTarjeta.message}</p>
                            )}
                        </div>

                        {/* Total Transferencia */}
                        <div className="space-y-2">
                            <Label htmlFor="transferencia">Total Transferencia *</Label>
                            <Input
                                id="transferencia"
                                type="number"
                                step="0.01"
                                {...register("TotalTransferencia", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalTransferencia && (
                                <p className="text-sm text-red-500">{errors.TotalTransferencia.message}</p>
                            )}
                        </div>

                        {/* Total Depósito Ventanilla */}
                        <div className="space-y-2">
                            <Label htmlFor="depositoVentanilla">Total Depósito Ventanilla *</Label>
                            <Input
                                id="depositoVentanilla"
                                type="number"
                                step="0.01"
                                {...register("TotalDepositoVentanilla", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalDepositoVentanilla && (
                                <p className="text-sm text-red-500">{errors.TotalDepositoVentanilla.message}</p>
                            )}
                        </div>

                        {/* Total Egresos */}
                        <div className="space-y-2">
                            <Label htmlFor="egresos">Total Egresos *</Label>
                            <Input
                                id="egresos"
                                type="number"
                                step="0.01"
                                {...register("TotalEgresos", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalEgresos && (
                                <p className="text-sm text-red-500">{errors.TotalEgresos.message}</p>
                            )}
                        </div>

                        {/* Depósitos a Banco */}
                        <div className="space-y-2">
                            <Label htmlFor="depositosBanco">Depósitos a Banco</Label>
                            <Input
                                id="depositosBanco"
                                type="number"
                                step="0.01"
                                {...register("TotalDepositosBanco", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalDepositosBanco && (
                                <p className="text-sm text-red-500">{errors.TotalDepositosBanco.message}</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Cálculos Finales */}
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Saldo Disponible:</span>
                            <span className="text-xl font-bold">{formatCurrency(saldoDisponible)}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-600">
                            <span className="font-medium">Entrega a Caja General:</span>
                            <span className="text-xl font-bold">{formatCurrency(entregaAGeneral)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Saldo Final (debe ser = Fondo Fijo):</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{formatCurrency(saldoFinal)}</span>
                                {Math.abs(saldoFinal - fondoFijo) < 0.01 ? (
                                    <Badge variant="default" className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Correcto
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Incorrecto
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            placeholder="Ingrese observaciones sobre el cuadre (opcional)"
                            rows={3}
                            {...register("Observaciones")}
                            disabled={isLoading}
                        />
                        {errors.Observaciones && (
                            <p className="text-sm text-red-500">{errors.Observaciones.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Botón de envío */}
            <div className="flex gap-3 justify-end">
                <Button 
                    type="submit" 
                    disabled={isLoading || (precuadre.UsuariosPendientes && precuadre.UsuariosPendientes.length > 0)}
                    size="lg"
                >
                    {isLoading ? "Procesando..." : "Cuadrar Caja Chica"}
                </Button>
            </div>
        </form>
    );
}
