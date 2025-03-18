"use client";

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CalendarRange, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getEsquemaPago } from "@/actions/PolizasActions";
import { iGetEsquemaPago } from "@/interfaces/CatPolizas";
import { SyncLoader } from 'react-spinners';

interface PropiedadesHistorialPagos {
    numeroPoliza: string;
}

export const HistorialPagosPoliza = ({ numeroPoliza }: PropiedadesHistorialPagos) => {
    const [esquemaPago, setEsquemaPago] = useState<iGetEsquemaPago | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const datos = await getEsquemaPago(numeroPoliza);
                if (datos) setEsquemaPago(datos);
            } catch (error) {
                console.error("Error al obtener datos: ", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerDatos();
    }, [numeroPoliza]);

    const obtenerColorEstado = (estado: string): "default" | "destructive" | "secondary" => {
        const estados = {
            "Pendiente": "secondary",
            "Pagado": "default",
            "Parcial": "destructive",
        } as const;

        return estados[estado as keyof typeof estados] || "default";
    };

    const calcularTotalPorPago = (pagosRealizados: { montoPagado: number }[]): number => {
        return pagosRealizados.reduce((total, pago) => total + pago.montoPagado, 0);
    };

    const formatearFecha = (fechaUTC: string | Date): string => {
        const fecha = new Date(fechaUTC);
        return new Intl.DateTimeFormat('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'America/Mexico_City'
        }).format(fecha);
    };

    if (!esquemaPago && !cargando) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No hay pagos registrados para esta póliza
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            {cargando ? (
                <div className="w-full h-full flex justify-center items-center fixed inset-0 bg-gray-200/50 dark:bg-slate-900/50 z-50">
                    <SyncLoader size={8} color="#9ca3af" />
                </div>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Resumen de Pagos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total a pagar:</span>
                                    <span className="font-medium">
                                        {formatCurrency(esquemaPago?.totalPrima || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total pagado:</span>
                                    <span className="font-medium">
                                        {formatCurrency(esquemaPago?.totalPagado || 0)}
                                    </span>
                                </div>
                                {/* {esquemaPago && esquemaPago?.descuentoProntoPago > 0 && (
                                    <div className="flex justify-between items-center text-green-600">
                                        <span className="text-sm">Descuento por pronto pago:</span>
                                        <span className="font-medium">
                                            {formatCurrency(esquemaPago.descuentoProntoPago)}
                                        </span>
                                    </div>
                                )} */}
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Saldo restante:</span>
                                    <span className="font-medium text-primary">
                                        {formatCurrency((esquemaPago?.totalPrima || 0) - (esquemaPago?.totalPagado || 0))}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CalendarRange className="h-4 w-4" />
                                Historial de Pagos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-4">
                                    {esquemaPago?.esquemaPagos.map((pago, index) => {
                                        const totalPagado = calcularTotalPorPago(pago.pagosRealizados);
                                        const porcentajePagado = (totalPagado / pago.montoPorPagar) * 100;

                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                Pago #{pago.numeroPago}
                                                            </span>
                                                            <Badge variant={obtenerColorEstado(pago.estado)}>
                                                                {pago.estado}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Fecha límite: {formatearFecha(pago.fechaPago)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {formatCurrency(pago.montoPorPagar)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {pago.pagosRealizados.length > 0 && (
                                                    <>
                                                        <div className="pl-4 space-y-2">
                                                            {pago.pagosRealizados.map((pagoRealizado, idx) => (
                                                                <div key={idx} className="text-sm flex justify-between">
                                                                    <span className="text-muted-foreground">
                                                                        {formatearFecha(pagoRealizado.fechaReal)}
                                                                    </span>
                                                                    <span>
                                                                        {formatCurrency(pagoRealizado.montoPagado)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between text-sm font-medium pt-2 border-t">
                                                                <span>Total acumulado:</span>
                                                                <div className="text-right">
                                                                    <div>{formatCurrency(totalPagado)}</div>
                                                                    <div className={porcentajePagado >= 100 ? "text-green-600" : "text-amber-600"}>
                                                                        ({porcentajePagado.toFixed(1)}%)
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {index < (esquemaPago?.esquemaPagos.length || 0) - 1 && (
                                                    <Separator className="mt-4" />
                                                )}
                                            </div>
                                        );
                                    })}

                                    {esquemaPago && esquemaPago?.pagosFueraDeRango.length > 0 && (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="space-y-2">
                                                <span className="font-medium">Pagos fuera de rango</span>
                                                {esquemaPago.pagosFueraDeRango.map((pago, idx) => (
                                                    <div key={idx} className="text-sm flex justify-between">
                                                        <span className="text-muted-foreground">
                                                            {formatearFecha(pago.fechaReal)}
                                                        </span>
                                                        <span>{formatCurrency(pago.montoPagado)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {esquemaPago?.mensajeAtraso && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {esquemaPago.mensajeAtraso}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
        </>
    );
};