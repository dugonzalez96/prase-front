"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { actualizarCapturablesSchema } from "@/schemas/admin/caja-chica/cajaChicaSchema";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Save } from "lucide-react";

type FormData = z.infer<typeof actualizarCapturablesSchema>;

interface FormActualizarCapturablesProps {
    onSubmit: (data: FormData) => Promise<void>;
    isLoading?: boolean;
    valoresActuales?: {
        SaldoReal?: number;
        TotalEfectivoCapturado?: number;
        TotalTarjetaCapturado?: number;
        TotalTransferenciaCapturado?: number;
        Observaciones?: string;
    };
}

export function FormActualizarCapturables({ 
    onSubmit,
    isLoading = false,
    valoresActuales
}: FormActualizarCapturablesProps) {
    const [sumaTotales, setSumaTotales] = useState(0);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue
    } = useForm<FormData>({
        resolver: zodResolver(actualizarCapturablesSchema),
        defaultValues: {
            SaldoReal: valoresActuales?.SaldoReal,
            TotalEfectivoCapturado: valoresActuales?.TotalEfectivoCapturado,
            TotalTarjetaCapturado: valoresActuales?.TotalTarjetaCapturado,
            TotalTransferenciaCapturado: valoresActuales?.TotalTransferenciaCapturado,
            Observaciones: valoresActuales?.Observaciones || ""
        }
    });

    // Watch fields
    const efectivo = watch("TotalEfectivoCapturado");
    const tarjeta = watch("TotalTarjetaCapturado");
    const transferencia = watch("TotalTransferenciaCapturado");

    // Calcular suma de totales
    useEffect(() => {
        const suma = (efectivo || 0) + (tarjeta || 0) + (transferencia || 0);
        setSumaTotales(suma);
        
        // Auto-actualizar SaldoReal si alguno de los totales cambió
        if (suma > 0) {
            setValue("SaldoReal", suma);
        }
    }, [efectivo, tarjeta, transferencia, setValue]);

    const handleFormSubmit = async (data: FormData) => {
        // Filtrar solo los campos que tienen valores
        const filteredData: Partial<FormData> = {};
        
        if (data.SaldoReal !== undefined && data.SaldoReal !== valoresActuales?.SaldoReal) {
            filteredData.SaldoReal = data.SaldoReal;
        }
        if (data.TotalEfectivoCapturado !== undefined && data.TotalEfectivoCapturado !== valoresActuales?.TotalEfectivoCapturado) {
            filteredData.TotalEfectivoCapturado = data.TotalEfectivoCapturado;
        }
        if (data.TotalTarjetaCapturado !== undefined && data.TotalTarjetaCapturado !== valoresActuales?.TotalTarjetaCapturado) {
            filteredData.TotalTarjetaCapturado = data.TotalTarjetaCapturado;
        }
        if (data.TotalTransferenciaCapturado !== undefined && data.TotalTransferenciaCapturado !== valoresActuales?.TotalTransferenciaCapturado) {
            filteredData.TotalTransferenciaCapturado = data.TotalTransferenciaCapturado;
        }
        if (data.Observaciones && data.Observaciones !== valoresActuales?.Observaciones) {
            filteredData.Observaciones = data.Observaciones;
        }

        await onSubmit(filteredData as FormData);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Información */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Use este formulario para guardar avances parciales antes del cierre definitivo. 
                    Puede actualizar uno o varios campos según necesite.
                </AlertDescription>
            </Alert>

            {/* Campos capturables */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        Actualizar Montos Capturados
                    </CardTitle>
                    <CardDescription>
                        Todos los campos son opcionales
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Total Efectivo */}
                        <div className="space-y-2">
                            <Label htmlFor="efectivo">Total Efectivo Capturado</Label>
                            <Input
                                id="efectivo"
                                type="number"
                                step="0.01"
                                placeholder={valoresActuales?.TotalEfectivoCapturado?.toString() || "0.00"}
                                {...register("TotalEfectivoCapturado", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalEfectivoCapturado && (
                                <p className="text-sm text-red-500">{errors.TotalEfectivoCapturado.message}</p>
                            )}
                        </div>

                        {/* Total Tarjeta */}
                        <div className="space-y-2">
                            <Label htmlFor="tarjeta">Total Tarjeta Capturado</Label>
                            <Input
                                id="tarjeta"
                                type="number"
                                step="0.01"
                                placeholder={valoresActuales?.TotalTarjetaCapturado?.toString() || "0.00"}
                                {...register("TotalTarjetaCapturado", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalTarjetaCapturado && (
                                <p className="text-sm text-red-500">{errors.TotalTarjetaCapturado.message}</p>
                            )}
                        </div>

                        {/* Total Transferencia */}
                        <div className="space-y-2">
                            <Label htmlFor="transferencia">Total Transferencia Capturado</Label>
                            <Input
                                id="transferencia"
                                type="number"
                                step="0.01"
                                placeholder={valoresActuales?.TotalTransferenciaCapturado?.toString() || "0.00"}
                                {...register("TotalTransferenciaCapturado", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            {errors.TotalTransferenciaCapturado && (
                                <p className="text-sm text-red-500">{errors.TotalTransferenciaCapturado.message}</p>
                            )}
                        </div>

                        {/* Suma calculada */}
                        {sumaTotales > 0 && (
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Suma de Totales</Label>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(sumaTotales)}</p>
                            </div>
                        )}
                    </div>

                    {/* Saldo Real */}
                    <div className="space-y-2">
                        <Label htmlFor="saldoReal">Saldo Real</Label>
                        <Input
                            id="saldoReal"
                            type="number"
                            step="0.01"
                            placeholder={valoresActuales?.SaldoReal?.toString() || "0.00"}
                            {...register("SaldoReal", { valueAsNumber: true })}
                            disabled={isLoading}
                            className="font-bold"
                        />
                        {errors.SaldoReal && (
                            <p className="text-sm text-red-500">{errors.SaldoReal.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Se calcula automáticamente al ingresar los totales, pero puede editarlo manualmente
                        </p>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            placeholder="Notas sobre el avance del cuadre (opcional)"
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

            {/* Valores actuales */}
            {valoresActuales && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-sm">Valores Guardados Actualmente</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm">
                        {valoresActuales.SaldoReal !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Saldo Real:</span>
                                <span className="font-semibold">{formatCurrency(valoresActuales.SaldoReal)}</span>
                            </div>
                        )}
                        {valoresActuales.TotalEfectivoCapturado !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Efectivo:</span>
                                <span className="font-semibold">{formatCurrency(valoresActuales.TotalEfectivoCapturado)}</span>
                            </div>
                        )}
                        {valoresActuales.TotalTarjetaCapturado !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tarjeta:</span>
                                <span className="font-semibold">{formatCurrency(valoresActuales.TotalTarjetaCapturado)}</span>
                            </div>
                        )}
                        {valoresActuales.TotalTransferenciaCapturado !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transferencia:</span>
                                <span className="font-semibold">{formatCurrency(valoresActuales.TotalTransferenciaCapturado)}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Botones */}
            <div className="flex gap-3 justify-end">
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    size="lg"
                >
                    {isLoading ? "Guardando..." : "Guardar Avance"}
                </Button>
            </div>
        </form>
    );
}
