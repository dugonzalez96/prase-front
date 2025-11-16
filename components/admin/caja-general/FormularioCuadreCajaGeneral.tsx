"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/format-number";
import { formatCurrency } from "@/lib/format";
import { cuadrarCajaGeneral } from "@/actions/CajaGeneralActions";
import { iGetSucursales } from "@/interfaces/SucursalesInterface";
import { useTransition } from "react";

interface FormularioCuadreCajaGeneralProps {
    usuarioId: number;
    sucursales: iGetSucursales[];
    onSuccess?: () => void;
    onCancel?: () => void;
    fechaActual: string;
    saldoEsperado: number;
}

const formularioCuadreSchema = z.object({
    sucursalId: z.number().min(1, "Debe seleccionar una sucursal"),
    totalEfectivoCapturado: z.number().min(0, "El monto debe ser mayor o igual a 0"),
    totalTarjetaCapturado: z.number().min(0, "El monto debe ser mayor o igual a 0"),
    totalTransferenciaCapturado: z.number().min(0, "El monto debe ser mayor o igual a 0"),
    observaciones: z.string().optional(),
});

export function FormularioCuadreCajaGeneral({
    usuarioId,
    sucursales,
    onSuccess,
    onCancel,
    fechaActual,
    saldoEsperado,
}: FormularioCuadreCajaGeneralProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formularioCuadreSchema>>({
        resolver: zodResolver(formularioCuadreSchema),
        defaultValues: {
            sucursalId: 0,
            totalEfectivoCapturado: 0,
            totalTarjetaCapturado: 0,
            totalTransferenciaCapturado: 0,
            observaciones: "",
        },
    });

    // Calcular saldo real
    const totalEfectivo = form.watch("totalEfectivoCapturado");
    const totalTarjeta = form.watch("totalTarjetaCapturado");
    const totalTransferencia = form.watch("totalTransferenciaCapturado");
    const saldoReal = totalEfectivo + totalTarjeta + totalTransferencia;
    const diferencia = saldoEsperado - saldoReal;

    const onSubmit = async (valores: z.infer<typeof formularioCuadreSchema>) => {
        startTransition(async () => {
            try {
                const respuesta = await cuadrarCajaGeneral({
                    fecha: fechaActual,
                    sucursalId: valores.sucursalId,
                    usuarioCuadreId: usuarioId,
                    observaciones: valores.observaciones || "",
                    saldoReal: saldoReal,
                    totalEfectivoCapturado: valores.totalEfectivoCapturado,
                    totalTarjetaCapturado: valores.totalTarjetaCapturado,
                    totalTransferenciaCapturado: valores.totalTransferenciaCapturado,
                });

                if (!respuesta) {
                    toast({
                        title: "Error",
                        description: "Ocurrió un error al cuadrar la caja",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: "Éxito",
                    description: "Caja cuadrada correctamente",
                });
                form.reset();
                onSuccess?.();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Ocurrió un error al cuadrar la caja",
                    variant: "destructive",
                });
            }
        });
    };

    const estaEnviando = form.formState.isSubmitting || isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="sucursalId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sucursal</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value?.toString() || ""}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona sucursal" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {sucursales.map((sucursal) => (
                                        <SelectItem
                                            key={sucursal.SucursalID}
                                            value={sucursal.SucursalID.toString()}
                                        >
                                            {sucursal.NombreSucursal}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="totalEfectivoCapturado"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Efectivo Capturado</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        value={formatCurrency(field.value, { showSymbol: true })}
                                        placeholder="$ 0.00"
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            field.onChange(Number(valor) / 100);
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="totalTarjetaCapturado"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Tarjeta Capturado</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        value={formatCurrency(field.value, { showSymbol: true })}
                                        placeholder="$ 0.00"
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            field.onChange(Number(valor) / 100);
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="totalTransferenciaCapturado"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Transferencia Capturado</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        value={formatCurrency(field.value, { showSymbol: true })}
                                        placeholder="$ 0.00"
                                        onChange={(e) => {
                                            const valor = e.target.value.replace(/[^0-9]/g, "");
                                            field.onChange(Number(valor) / 100);
                                        }}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Información del saldo */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Saldo Esperado:</span>
                        <span className="font-semibold">$ {formatNumber(saldoEsperado)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Saldo Real (Capturado):</span>
                        <span className="font-semibold">$ {formatNumber(saldoReal)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-medium">Diferencia:</span>
                        <span className={`font-semibold ${diferencia === 0 ? "text-green-600" : "text-red-600"}`}>
                            {diferencia === 0 ? "$ 0.00 (Cuadrado)" : `$ ${formatNumber(Math.abs(diferencia))} ${diferencia > 0 ? "(Faltante)" : "(Sobrante)"}`}
                        </span>
                    </div>
                </div>

                {diferencia !== 0 && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Hay una diferencia de $ {formatNumber(Math.abs(diferencia))}. {diferencia > 0 ? "Faltante" : "Sobrante"} en el cuadre.
                        </AlertDescription>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observaciones</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Agrega observaciones del cuadre..."
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={estaEnviando}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={estaEnviando}>
                        {estaEnviando ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cuadrando...
                            </>
                        ) : (
                            "Proceder al Cuadre"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
